import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { readFile } from "fs/promises";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";
import { sendConfiguredConversions } from "../conversions";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>\"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function safeCss(value: string | null | undefined) {
  return (value ?? "").replace(/<\/?style/gi, "").replace(/expression\s*\(/gi, "");
}

function renderLanding(page: Awaited<ReturnType<typeof db.getLandingPageBySlug>>) {
  if (!page) return null;
  const content = JSON.parse(page.contentJson) as { badge?: string; headline?: string; cta?: string; accent?: string };
  const pixels = page.pixels.filter(pixel => pixel.enabled);
  const meta = pixels.find(pixel => pixel.provider === "meta");
  const tiktok = pixels.find(pixel => pixel.provider === "tiktok");
  const line = pixels.find(pixel => pixel.provider === "line");
  const headline = escapeHtml(content.headline ?? page.title).replace(/\\n/g, "<br>");
  const css = safeCss(page.customCss);
  const accent = content.accent === "lilac" ? "#ded6ff" : "#d9f36b";
  const pixelScripts = [
    meta ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${escapeHtml(meta.pixelId)}');fbq('track','PageView');</script>` : "",
    tiktok ? `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','once','off','on','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load('${escapeHtml(tiktok.pixelId)}');ttq.page();}(window,document,'ttq');</script>` : "",
    line ? `<script>window._lineTagId=${JSON.stringify(line.pixelId)};</script>` : "",
  ].join("\n");
  return `<!doctype html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}">${pixelScripts}<style>${css}</style></head><body><main class="public-page"><span class="badge">${escapeHtml(content.badge ?? "ADSHUB CAMPAIGN")}</span><h1>${headline}</h1><p>${escapeHtml(page.description ?? "Landing page สำหรับแคมเปญของคุณ")}</p><button id="cta">${escapeHtml(content.cta ?? "เริ่มต้น")}</button><small>${escapeHtml(page.slug)} · ${escapeHtml(page.type)}</small></main><script>const pageId=${page.id};const send=(eventName)=>fetch('/api/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId,eventName,pageUrl:location.href,eventId:crypto.randomUUID()})}).catch(()=>{});send('PageView');document.getElementById('cta')?.addEventListener('click',()=>send('Lead'));</script><style>body{margin:0;background:#f5f5f0;color:#10110e;font-family:Arial,sans-serif}.public-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;background:radial-gradient(circle at 50% 20%,${accent},transparent 34%)}.badge{font-size:12px;letter-spacing:.12em;font-weight:700}.public-page h1{max-width:760px;font-size:clamp(42px,8vw,92px);line-height:1;white-space:pre-line;margin:22px 0}.public-page p{max-width:520px;color:#686961;line-height:1.7}.public-page button{margin:24px 0;padding:15px 24px;border:0;border-radius:12px;background:#10110e;color:#fff;font-weight:700;cursor:pointer}.public-page small{color:#999;font-size:11px}</style></body></html>`;
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript()));
  app.get("/manus-routes.json", async (_req, res) => {
    try { const routes = await readFile(path.resolve(process.cwd(), "public/manus-routes.json"), "utf8"); res.set("Cache-Control", "no-store").type("application/json").send(routes); }
    catch { res.status(404).json({ routes: [] }); }
  });
  app.get("/go/:slug", async (req, res) => {
    const page = renderLanding(await db.getLandingPageBySlug(req.params.slug));
    if (!page) { res.status(404).send("Landing page not found"); return; }
    res.set("Cache-Control", "public, max-age=60").type("html").send(page);
  });
  app.post("/api/events", async (req, res) => {
    try {
      const input = req.body ?? {};
      const result = await sendConfiguredConversions({ ...input, clientIp: req.ip, userAgent: req.headers["user-agent"] });
      res.json({ ok: true, results: result });
    } catch (error) { res.status(502).json({ ok: false, error: error instanceof Error ? error.message : "event delivery failed" }); }
  });
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.NODE_ENV === "development") await setupVite(app, server); else serveStatic(app);
  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
