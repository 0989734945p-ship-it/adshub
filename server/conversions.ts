import crypto from "node:crypto";
import * as db from "./db";

type ConversionInput = {
  eventName: string;
  eventId?: string;
  pageId?: number;
  pageUrl?: string;
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  properties?: Record<string, unknown>;
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

const META_VERSION = process.env.META_GRAPH_VERSION || "v26.0";
const TIKTOK_EVENTS_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

function hash(value?: string) {
  if (!value) return undefined;
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function eventId(input: ConversionInput) {
  return input.eventId || crypto.randomUUID();
}

export async function sendMetaEvent(pixelId: string, input: ConversionInput, accessToken: string) {
  const id = eventId(input);
  const data = [{
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: id,
    event_source_url: input.pageUrl,
    action_source: "website",
    user_data: {
      em: input.email ? [hash(input.email)] : undefined,
      ph: input.phone ? [hash(input.phone)] : undefined,
      client_ip_address: input.clientIp,
      client_user_agent: input.userAgent,
      fbp: input.fbp,
      fbc: input.fbc,
    },
    custom_data: { value: input.value, currency: input.currency, ...(input.properties ?? {}) },
  }];
  const response = await fetch(`https://graph.facebook.com/${META_VERSION}/${encodeURIComponent(pixelId)}/events`, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ data }),
  });
  const body = await response.text();
  await db.recordConversionEvent({ eventId: id, landingPageId: input.pageId, provider: "meta", eventName: input.eventName, status: response.ok ? "sent" : "failed", response: body.slice(0, 4000) });
  if (!response.ok) throw new Error(`Meta CAPI ${response.status}: ${body.slice(0, 500)}`);
  return { provider: "meta" as const, eventId: id, body: JSON.parse(body) };
}

export async function sendTikTokEvent(pixelCode: string, input: ConversionInput, accessToken: string) {
  const id = eventId(input);
  const response = await fetch(TIKTOK_EVENTS_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "Access-Token": accessToken },
    body: JSON.stringify({
      pixel_code: pixelCode,
      event: input.eventName,
      event_id: id,
      timestamp: new Date().toISOString(),
      context: {
        user_agent: input.userAgent,
        ip: input.clientIp,
        page: { url: input.pageUrl },
        user: { email: hash(input.email), phone_number: hash(input.phone) },
        ad: { callback: input.properties?.ttclid },
      },
      properties: { value: input.value, currency: input.currency, ...(input.properties ?? {}) },
    }),
  });
  const body = await response.text();
  await db.recordConversionEvent({ eventId: id, landingPageId: input.pageId, provider: "tiktok", eventName: input.eventName, status: response.ok ? "sent" : "failed", response: body.slice(0, 4000) });
  if (!response.ok) throw new Error(`TikTok Events API ${response.status}: ${body.slice(0, 500)}`);
  return { provider: "tiktok" as const, eventId: id, body: JSON.parse(body) };
}

export async function sendConfiguredConversions(input: ConversionInput) {
  const page = input.pageId ? await db.getLandingPageById(input.pageId) : undefined;
  const settings = await db.getSettings(true);
  const results: Array<{ provider: string; ok: boolean; error?: string }> = [];
  const metaPixel = page?.pixels.find((pixel) => pixel.provider === "meta" && pixel.enabled)?.pixelId;
  const tiktokPixel = page?.pixels.find((pixel) => pixel.provider === "tiktok" && pixel.enabled)?.pixelId;
  if (metaPixel && settings.meta_capi_token) {
    try { await sendMetaEvent(metaPixel, input, settings.meta_capi_token); results.push({ provider: "meta", ok: true }); } catch (error) { results.push({ provider: "meta", ok: false, error: error instanceof Error ? error.message : "unknown error" }); }
  }
  if (tiktokPixel && settings.tiktok_api_token) {
    try { await sendTikTokEvent(tiktokPixel, input, settings.tiktok_api_token); results.push({ provider: "tiktok", ok: true }); } catch (error) { results.push({ provider: "tiktok", ok: false, error: error instanceof Error ? error.message : "unknown error" }); }
  }
  return results;
}
