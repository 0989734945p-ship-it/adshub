import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, uniqueIndex } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "editor", "analyst"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const landingPages = mysqlTable("landing_pages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull(),
  type: mysqlEnum("type", ["game", "seo", "selling"]).default("selling").notNull(),
  status: mysqlEnum("status", ["draft", "live", "paused"]).default("draft").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentJson: text("contentJson").notNull(),
  customCss: text("customCss"),
  createdBy: int("createdBy"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ slugIdx: uniqueIndex("landing_pages_slug_unique").on(table.slug), statusIdx: index("landing_pages_status_idx").on(table.status) }));

export const landingPixels = mysqlTable("landing_pixels", {
  id: int("id").autoincrement().primaryKey(),
  landingPageId: int("landingPageId").notNull(),
  provider: mysqlEnum("provider", ["meta", "tiktok", "line"]).notNull(),
  pixelId: varchar("pixelId", { length: 255 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ pageProviderUnique: uniqueIndex("landing_pixels_page_provider_unique").on(table.landingPageId, table.provider) }));

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull(),
  humanPageId: int("humanPageId").notNull(),
  botPageId: int("botPageId").notNull(),
  activeMode: mysqlEnum("activeMode", ["human", "bot", "auto"]).default("auto").notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
  createdBy: int("createdBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ slugIdx: uniqueIndex("campaigns_slug_unique").on(table.slug) }));

export const workspaceSettings = mysqlTable("workspace_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const conversionEvents = mysqlTable("conversion_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 128 }).notNull(),
  landingPageId: int("landingPageId"),
  provider: mysqlEnum("provider", ["meta", "tiktok"]).notNull(),
  eventName: varchar("eventName", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  response: text("response"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ eventProviderUnique: uniqueIndex("conversion_events_event_provider_unique").on(table.eventId, table.provider) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LandingPage = typeof landingPages.$inferSelect;
export type LandingPixel = typeof landingPixels.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type WorkspaceSetting = typeof workspaceSettings.$inferSelect;
export type ConversionEvent = typeof conversionEvents.$inferSelect;
