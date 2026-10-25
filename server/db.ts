import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Campaign,
  InsertUser,
  LandingPage,
  LandingPixel,
  campaigns,
  conversionEvents,
  landingPages,
  landingPixels,
  users,
  workspaceSettings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function checkDatabase(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch (error) {
    console.warn("[Database] Readiness check failed:", error instanceof Error ? error.message : "unknown error");
    return false;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, role: users.role, lastSignedIn: users.lastSignedIn }).from(users).orderBy(asc(users.name));
}

export async function updateUserRole(id: number, role: "admin" | "editor" | "analyst" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ role }).where(eq(users.id, id));
}

const defaultPages = [
  { name: "หน้าขายของหลัก", slug: "shop-main", type: "selling" as const, status: "live" as const, title: "ร้านของคุณ · พร้อมขาย", description: "สินค้าและข้อเสนอสำหรับลูกค้าจริง", contentJson: JSON.stringify({ badge: "LIMITED DROP", headline: "ของที่ใช่\nส่งถึงมือคุณ", cta: "ช้อปเลย", accent: "lime" }), customCss: "" },
  { name: "Game / SEO layer", slug: "game-seo", type: "game" as const, status: "live" as const, title: "GAME ONLINE", description: "หน้าเกมและเนื้อหาสำหรับ crawler", contentJson: JSON.stringify({ badge: "PLAY TO DISCOVER", headline: "เล่นให้สนุก\nแล้วค้นพบสิ่งใหม่", cta: "เริ่มเกม", accent: "lilac" }), customCss: "" },
];

export async function listLandingPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(landingPages).orderBy(desc(landingPages.updatedAt));
}

export async function getLandingPageBySlug(slug: string, includeDraft = false) {
  const db = await getDb();
  if (!db) return undefined;
  await ensureSeedPages();
  const conditions = includeDraft ? eq(landingPages.slug, slug) : and(eq(landingPages.slug, slug), eq(landingPages.status, "live"));
  const result = await db.select().from(landingPages).where(conditions).limit(1);
  if (!result[0]) return undefined;
  const pixels = await db.select().from(landingPixels).where(eq(landingPixels.landingPageId, result[0].id));
  return { ...result[0], pixels };
}

export async function getLandingPageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(landingPages).where(eq(landingPages.id, id)).limit(1);
  if (!result[0]) return undefined;
  const pixels = await db.select().from(landingPixels).where(eq(landingPixels.landingPageId, id));
  return { ...result[0], pixels };
}

export async function ensureSeedPages() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: landingPages.id }).from(landingPages).limit(1);
  if (existing.length > 0) return;
  await db.insert(landingPages).values(defaultPages);
}

export async function ensureSeedCampaign() {
  const db = await getDb();
  if (!db) return;
  await ensureSeedPages();
  const existing = await db.select({ id: campaigns.id }).from(campaigns).limit(1);
  if (existing.length > 0) return;
  const pageRows = await db.select({ id: landingPages.id, slug: landingPages.slug }).from(landingPages).where(inArray(landingPages.slug, ["shop-main", "game-seo"]));
  const pageIds = new Map(pageRows.map((page) => [page.slug, page.id]));
  const humanPageId = pageIds.get("shop-main");
  const botPageId = pageIds.get("game-seo");
  if (!humanPageId || !botPageId) return;
  await db.insert(campaigns).values({ name: "Main traffic router", slug: "main", humanPageId, botPageId, activeMode: "auto", status: "active" });
}

export async function upsertLandingPage(input: {
  id?: number; name: string; slug: string; type: "game" | "seo" | "selling"; status: "draft" | "live" | "paused"; title: string; description?: string; contentJson: string; customCss?: string; userId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (input.id) {
    await db.update(landingPages).set({ name: input.name, slug: input.slug, type: input.type, status: input.status, title: input.title, description: input.description ?? null, contentJson: input.contentJson, customCss: input.customCss ?? null, updatedBy: input.userId }).where(eq(landingPages.id, input.id));
    return getLandingPageById(input.id);
  }
  const result = await db.insert(landingPages).values({ ...input, description: input.description ?? null, customCss: input.customCss ?? null, createdBy: input.userId }).$returningId();
  return getLandingPageById(result[0].id);
}

export async function upsertLandingPixel(input: { landingPageId: number; provider: "meta" | "tiktok" | "line"; pixelId: string; enabled?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(landingPixels).values({ ...input, enabled: input.enabled ?? true }).onDuplicateKeyUpdate({ set: { pixelId: input.pixelId, enabled: input.enabled ?? true } });
}

export async function getSettings(includeSecrets = false) {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(workspaceSettings);
  const values: Record<string, string> = {};
  for (const row of rows) {
    if (!includeSecrets && ["meta_capi_token", "tiktok_api_token"].includes(row.key)) continue;
    values[row.key] = row.value ?? "";
  }
  return values;
}

export async function setSettings(values: Record<string, string>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  for (const [key, value] of Object.entries(values)) {
    await db.insert(workspaceSettings).values({ key, value, updatedBy: userId }).onDuplicateKeyUpdate({ set: { value, updatedBy: userId } });
  }
}

export async function recordConversionEvent(input: { eventId: string; landingPageId?: number; provider: "meta" | "tiktok"; eventName: string; status: "pending" | "sent" | "failed"; response?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(conversionEvents).values(input).onDuplicateKeyUpdate({ set: { status: input.status, response: input.response ?? null } });
}

export async function listCampaigns(): Promise<Campaign[]> {
  const db = await getDb();
  if (!db) return [];
  await ensureSeedCampaign();
  return db.select().from(campaigns).orderBy(desc(campaigns.updatedAt));
}

export async function getCampaignBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  await ensureSeedCampaign();
  const result = await db.select().from(campaigns).where(and(eq(campaigns.slug, slug), eq(campaigns.status, "active"))).limit(1);
  return result[0];
}

export async function resolveCampaignPage(slug: string, userAgent = "") {
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return undefined;
  const looksLikeBot = /bot|crawler|spider|slurp|facebookexternalhit|preview|headless/i.test(userAgent);
  const pageId = campaign.activeMode === "bot" || (campaign.activeMode === "auto" && looksLikeBot) ? campaign.botPageId : campaign.humanPageId;
  const page = await getLandingPageById(pageId);
  if (!page || page.status !== "live") return undefined;
  return { campaign, page, resolvedMode: pageId === campaign.botPageId ? "bot" as const : "human" as const };
}

export async function setCampaignMode(id: number, activeMode: "human" | "bot" | "auto", userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  void userId;
  await db.update(campaigns).set({ activeMode, updatedAt: new Date() }).where(eq(campaigns.id, id));
}
