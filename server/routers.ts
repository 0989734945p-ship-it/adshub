import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { sendConfiguredConversions } from "./conversions";

const pageInput = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.enum(["game", "seo", "selling"]),
  status: z.enum(["draft", "live", "paused"]),
  title: z.string().trim().min(1).max(255),
  description: z.string().max(2000).optional(),
  contentJson: z.string().max(50000),
  customCss: z.string().max(30000).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie("webdev_app_session", { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  pages: router({
    list: protectedProcedure.query(async () => {
      await db.ensureSeedPages();
      const pages = await db.listLandingPages();
      return pages.map(({ contentJson, ...page }) => ({ ...page, content: JSON.parse(contentJson) }));
    }),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const page = await db.getLandingPageById(input.id);
      if (!page) return null;
      return { ...page, content: JSON.parse(page.contentJson) };
    }),
    upsert: protectedProcedure.input(pageInput).mutation(async ({ input, ctx }) => {
      if (!ctx.user || !["admin", "editor"].includes(ctx.user.role)) throw new Error("Editor access required");
      return db.upsertLandingPage({ ...input, userId: ctx.user.id });
    }),
  }),
  publicLanding: router({
    get: publicProcedure.input(z.object({ slug: z.string().min(1).max(160) })).query(async ({ input }) => {
      const page = await db.getLandingPageBySlug(input.slug);
      if (!page) return null;
      return { id: page.id, slug: page.slug, type: page.type, title: page.title, description: page.description, customCss: page.customCss, content: JSON.parse(page.contentJson), pixels: page.pixels.filter((pixel) => pixel.enabled).map((pixel) => ({ provider: pixel.provider, pixelId: pixel.pixelId })) };
    }),
  }),
  campaigns: router({
    list: protectedProcedure.query(async () => db.listCampaigns()),
    setMode: protectedProcedure.input(z.object({ id: z.number().int().positive(), activeMode: z.enum(["human", "bot", "auto"]) })).mutation(async ({ input, ctx }) => {
      if (!ctx.user || !["admin", "editor"].includes(ctx.user.role)) throw new Error("Editor access required");
      await db.setCampaignMode(input.id, input.activeMode, ctx.user.id);
      return { success: true } as const;
    }),
  }),
  tracking: router({
    savePixel: protectedProcedure.input(z.object({ landingPageId: z.number().int().positive(), provider: z.enum(["meta", "tiktok", "line"]), pixelId: z.string().trim().min(1).max(255), enabled: z.boolean().optional() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user || !["admin", "editor"].includes(ctx.user.role)) throw new Error("Editor access required");
      await db.upsertLandingPixel(input);
      return { success: true } as const;
    }),
    sendEvent: publicProcedure.input(z.object({ eventName: z.string().trim().min(1).max(100), pageId: z.number().int().positive().optional(), pageUrl: z.string().url().optional(), eventId: z.string().max(128).optional(), email: z.string().email().optional(), phone: z.string().max(40).optional(), value: z.number().optional(), currency: z.string().max(8).optional(), properties: z.record(z.string(), z.unknown()).optional(), fbp: z.string().optional(), fbc: z.string().optional() })).mutation(async ({ input, ctx }) => sendConfiguredConversions({ ...input, clientIp: ctx.req.ip, userAgent: ctx.req.headers["user-agent"] })),
  }),
  settings: router({
    get: protectedProcedure.query(() => db.getSettings(false)),
    save: protectedProcedure.input(z.object({ facebookPixelId: z.string().max(255).optional(), lineTagId: z.string().max(255).optional(), tiktokPixelId: z.string().max(255).optional(), tiktokApiToken: z.string().max(16000).optional(), metaCapiToken: z.string().max(16000).optional(), customCss: z.string().max(30000).optional() })).mutation(async ({ input, ctx }) => {
      if (!ctx.user || !["admin", "editor"].includes(ctx.user.role)) throw new Error("Editor access required");
      const values: Record<string, string> = {};
      if (input.facebookPixelId !== undefined) values.facebook_pixel_id = input.facebookPixelId;
      if (input.lineTagId !== undefined) values.line_tag_id = input.lineTagId;
      if (input.tiktokPixelId !== undefined) values.tiktok_pixel_id = input.tiktokPixelId;
      if (input.tiktokApiToken !== undefined && input.tiktokApiToken.length > 0) values.tiktok_api_token = input.tiktokApiToken;
      if (input.metaCapiToken !== undefined && input.metaCapiToken.length > 0) values.meta_capi_token = input.metaCapiToken;
      if (input.customCss !== undefined) values.custom_css = input.customCss;
      await db.setSettings(values, ctx.user.id);
      return { success: true } as const;
    }),
  }),
  team: router({
    list: protectedProcedure.query(() => db.listUsers()),
    setRole: adminProcedure.input(z.object({ id: z.number().int().positive(), role: z.enum(["admin", "editor", "analyst", "user"]) })).mutation(async ({ input }) => { await db.updateUserRole(input.id, input.role); return { success: true } as const; }),
  }),
});

export type AppRouter = typeof appRouter;
