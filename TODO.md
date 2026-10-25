# AdsHub TODO

## Authentication and multi-level access
- [x] ผู้ดูแลและผู้ใช้ภายในเข้าสู่ระบบผ่าน Manus OAuth จริง พร้อม session cookie ที่ใช้ได้ใน embedded Preview และ published site
- [x] ระบบเก็บบัญชี OAuth ในฐานข้อมูล และรองรับ role `admin`, `editor`, `analyst`, `user`
- [x] Admin ดูรายชื่อบัญชีและเปลี่ยน role ได้จาก Team Access; Editor แก้ไขหน้า/Pixel/Settings ได้; Analyst อ่านข้อมูลได้แต่แก้ไขไม่ได้

## Persistent landing pages and switching
- [x] ระบบบันทึก Landing Page ถาวรด้วยชื่อ slug ประเภท `game`, `seo`, `selling` สถานะ `draft`, `live`, `paused`, title, description, content และ Custom CSS
- [x] ระบบสร้าง/แก้ไขหน้าและ seed-safe initialization ไม่เขียนทับข้อมูลที่ผู้ใช้แก้แล้ว
- [x] Public routes `/go/:slug`, `/c/:slug` และ `/campaign/:slug` แสดงเฉพาะหน้า live; campaign router ใช้ configuration ในฐานข้อมูลเลือกหน้าเกม/SEO หรือหน้าขายของ และ auto-route ตาม user-agent
- [x] หน้า public ฝัง Custom CSS และแสดง Meta Pixel, TikTok Pixel และ LINE tag ตามค่าของหน้านั้น

## Pixel and Conversion API
- [x] ตั้งค่า Facebook Pixel ID, TikTok Pixel ID และ LINE tag ID แยกตาม Landing Page และเก็บถาวร
- [x] ตั้งค่า Meta CAPI token และ TikTok Events API token จากหน้า authenticated settings โดย token ไม่ถูกส่งกลับใน query หรือฝั่ง public browser; Meta ส่ง token ผ่าน Authorization header
- [x] `/api/events` รับ event จาก public landing แล้วส่ง Meta CAPI `/events` และ TikTok Events API พร้อม `event_id`, timestamp, page URL และ match keys เมื่อมีข้อมูล
- [x] บันทึกสถานะ `sent`/`failed` และ response audit ของแต่ละ provider เพื่อ debug และรองรับ retry/deduplication

## Production validation and delivery
- [x] migration ถูก commit และใช้ฐานข้อมูล managed MySQL เดียวกันตามข้อจำกัดของ WebDev; `pnpm db:migrate` ผ่าน
- [x] `/manus-routes.json` สะท้อน route dashboard, public landing และ campaign router
- [x] ผ่าน `pnpm check`, `pnpm test`, `pnpm build` และ HTTP readiness check (`/api/health` = database ready) โดยไม่เปิดเผย credential
- [x] สร้าง checkpoint หลังตรวจ source และสถานะ runtime เรียบร้อย; publish สำเร็จที่ `https://adshub-kbqdrmd5.manus.space`
