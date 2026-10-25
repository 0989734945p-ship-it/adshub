# AdsHub TODO

## Authentication and multi-level access
- [ ] ผู้ดูแลและผู้ใช้ภายในเข้าสู่ระบบผ่าน Manus OAuth จริง พร้อม session cookie ที่ใช้ได้ใน embedded Preview และ published site
- [ ] ระบบเก็บบัญชี OAuth ในฐานข้อมูล และรองรับ role `admin`, `editor`, `analyst`, `user`
- [ ] Admin ดูรายชื่อบัญชีและเปลี่ยน role ได้; Editor แก้ไขหน้า/Pixel/Settings ได้; Analyst อ่านข้อมูลได้แต่แก้ไขไม่ได้

## Persistent landing pages and switching
- [ ] ระบบบันทึก Landing Page ถาวรด้วยชื่อ slug ประเภท `game`, `seo`, `selling` สถานะ `draft`, `live`, `paused`, title, description, content และ Custom CSS
- [ ] ระบบสร้าง/แก้ไขหน้าและ seed-safe initialization ไม่เขียนทับข้อมูลที่ผู้ใช้แก้แล้ว
- [ ] Public route `/go/:slug` แสดงเฉพาะหน้า live และสลับหน้าเกม/SEO กับหน้าขายของผ่าน page/campaign configuration ได้จริง
- [ ] หน้า public ฝัง Custom CSS และแสดง Meta Pixel, TikTok Pixel และ LINE tag ตามค่าของหน้านั้น

## Pixel and Conversion API
- [ ] ตั้งค่า Facebook Pixel ID, TikTok Pixel ID และ LINE tag ID แยกตาม Landing Page และเก็บถาวร
- [ ] ตั้งค่า Meta CAPI token และ TikTok Events API token จากหน้า authenticated settings โดย token ไม่ถูกส่งกลับใน query หรือฝั่ง public browser
- [ ] `/api/events` รับ event จาก public landing แล้วส่ง Meta CAPI `/events` และ TikTok Events API พร้อม `event_id`, timestamp, page URL และ match keys เมื่อมีข้อมูล
- [ ] บันทึกสถานะ `sent`/`failed` และ response audit ของแต่ละ provider เพื่อ debug และรองรับ retry/deduplication

## Production validation and delivery
- [ ] migration ถูก commit และใช้ฐานข้อมูล managed MySQL เดียวกันตามข้อจำกัดของ WebDev
- [ ] `/manus-routes.json` สะท้อน route dashboard และ public landing
- [ ] ผ่าน `pnpm check`, `pnpm build`, migration และ HTTP readiness check โดยไม่เปิดเผย credential
- [ ] สร้าง checkpoint หลังตรวจ source และสถานะ runtime เรียบร้อย
