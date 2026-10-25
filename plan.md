# AdsHub Production — Plan

## Scope
ต่อยอด AdsHub เวอร์ชันแรกให้เป็นระบบใช้งานจริงสำหรับทีมยิงโฆษณา: ล็อกอินด้วย Manus OAuth, บัญชีและสิทธิ์หลายระดับ, บันทึก Landing Page และ Pixel แบบถาวร, public route สำหรับแคมเปญ, Custom CSS, การสลับหน้าเกม/SEO กับหน้าขายของ และการส่ง server-side events ไป Meta CAPI/TikTok Events API

## Implementation approach
- คง React + TypeScript + Tailwind ที่ frontend และ Express + tRPC + Drizzle ที่ backend
- ใช้ managed MySQL ของ WebDev เป็นฐานข้อมูลโครงการเดียวสำหรับ development และ production พร้อม migration ที่ commit ใน `drizzle/`
- ใช้ Manus OAuth และ role ใน `users` (`admin`, `editor`, `analyst`, `user`) โดย admin เท่านั้นที่เปลี่ยน role ได้
- เก็บ landing pages, page pixels, campaigns, workspace settings และ conversion event audit ในฐานข้อมูล; access token รับผ่าน settings ฝั่ง authenticated server และไม่ส่งคืนใน query ฝั่ง client
- สร้าง `/go/:slug` เป็น public landing route ที่ render เนื้อหาจากฐานข้อมูล, ฝัง Meta/TikTok/LINE tags ตาม page config, ใส่ Custom CSS และส่ง PageView/Lead ไป `/api/events`
- สร้าง adapter ฝั่งเซิร์ฟเวอร์สำหรับ Meta `/events` และ TikTok Events API พร้อม `event_id` เพื่อรองรับ deduplication และบันทึกผลส่งใน `conversion_events`

## Design direction
คง Editorial SaaS control room เดิม: พื้นครีม, เส้นกรอบดำ, acid lime เป็น active state, lilac สำหรับ analytics และ left rail ที่อ่านสถานะเร็ว

## Project structure
- `client/src/pages/Home.tsx` — dashboard, persistent page editor, pixel/settings/team controls
- `server/_core/index.ts` — health, route manifest, public `/go/:slug`, public event collector
- `server/routers.ts` — auth-aware tRPC for pages, tracking, settings and team roles
- `server/db.ts` — Drizzle queries and seed-safe page initialization
- `server/conversions.ts` — Meta CAPI/TikTok Events API adapters and event audit
- `drizzle/schema.ts` — users, landing pages, pixels, campaigns, settings and events
- `drizzle/0001_production_ads.sql` — additive production migration
- `public/manus-routes.json` — dashboard and public route declarations

## Required behaviors
- ผู้ดูแลเข้าสู่ระบบด้วย Manus OAuth และเห็น role ของตนเอง
- Admin เปลี่ยน role ของบัญชีที่เคยเข้าสู่ระบบได้; Editor จัดการหน้า/Pixel/Settings ได้; Analyst อ่านข้อมูลได้
- Landing Page มี slug, type, status, title, content, Custom CSS และถูกเก็บถาวรในฐานข้อมูล
- ทุกหน้าเก็บ Meta Pixel, TikTok Pixel และ LINE tag แยกกันได้
- Public `/go/:slug` แสดงเฉพาะหน้า `live`, ฝัง browser pixels และมีปุ่มที่ส่ง event server-side
- Meta CAPI และ TikTok Events API ใช้ token ฝั่ง server, ไม่ expose token ไปยัง browser, บันทึกผลสำเร็จ/ล้มเหลวและใช้ event ID เดิมเพื่อ deduplication
- สลับหน้าเกม/SEO กับหน้าขายของได้ด้วย active page/campaign และมี preview Bot/Human ใน dashboard
- ผ่าน migration, typecheck, build, route manifest และ readiness check

## Explicit constraint
ผู้ใช้เลือกไม่ใช้ Project Secret card และต้องการตั้งค่า Token ในหน้าระบบหลัก ดังนั้น token จะถูกเขียนลง workspace settings ในฐานข้อมูลและอ่านเฉพาะฝั่ง server; สำหรับระบบที่มี requirement ด้าน compliance สูง ควรย้ายไป protected project secret ก่อน production จริง
