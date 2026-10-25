# AdsHub Internal Page Manager — Plan

## Scope
สร้างระบบจัดการภายในสำหรับผู้ดูแล/ทีมการตลาด เพื่อสร้าง แก้ไข สลับโหมด เปิดใช้งาน และติดตาม Landing Page หลายแบบ โดยมีหน้าเกม/หน้า SEO สำหรับ crawler และหน้าขายของสำหรับผู้ใช้งานจริง รวมถึงพื้นที่ตั้งค่า Facebook Pixel, TikTok Pixel, Conversion API/Pixel API, custom CSS, แคมเปญ และบัญชีผู้ใช้งานภายใน

## Implementation approach
- ใช้ React + TypeScript + Tailwind ใน frontend และคงโครงสร้าง tRPC/Express/Drizzle ของ web-db-user starter
- ใช้ Manus OAuth เป็นระบบเข้าสู่ระบบหลักตามค่าเริ่มต้นของแพลตฟอร์ม พร้อมแสดงสถานะผู้ใช้และปุ่มเริ่มเข้าสู่ระบบจริงจาก UI
- ทำแดชบอร์ดฝั่ง client ให้มีข้อมูลตัวอย่างที่เป็นตัวแทนของ landing pages, integrations และกิจกรรมล่าสุด เพื่อให้ preview ใช้งานและตรวจแนวทาง UX ได้ทันที
- เตรียม route manifest ที่ `/manus-routes.json` สำหรับ `/`, `/pages`, `/pixels`, `/team`, `/settings`
- โครงสร้างข้อมูลระยะต่อไปอยู่ใน Drizzle: users, landing_pages, tracking_integrations และ campaigns; ค่าลับของ Conversion API ต้องเก็บฝั่งเซิร์ฟเวอร์/Secrets ไม่ฝังใน frontend

## Design direction
### Style options considered
- Editorial SaaS control room — ความน่าจะเป็น 0.08: แผงควบคุมสะอาด ตัวอักษรใหญ่ มีเส้นกรอบดำและ accent สีเขียวมะนาว
- Neon ad-ops cockpit — ความน่าจะเป็น 0.06: แดชบอร์ดมืดและเน้นสีสดเหมาะกับทีม performance
- Soft utility studio — ความน่าจะเป็น 0.05: โทนครีม นุ่ม และเป็นมิตร เหมาะกับ no-code builder

เลือก **Editorial SaaS control room** เพื่อเชื่อมกับ reference xlinkx.xyz ที่ใช้การ์ดเปรียบเทียบและภาษาการขายชัดเจน แต่ปรับให้เหมาะกับเครื่องมือภายในและไม่คัดลอกแบรนด์/ข้อความ

- **Design Movement:** editorial utility + Swiss dashboard, ใช้ typography เป็นตัวนำและมี control surfaces ที่อ่านเร็ว
- **Core Principles:** เห็นสถานะในทันที, แก้ไขได้โดยไม่ต้องเดา, แยก crawler/human อย่างชัดเจน, ลดความเสี่ยงจาก tracking config
- **Color Philosophy:** พื้นขาวอมครีมช่วยให้โค้ดและข้อมูลอ่านง่าย; หมึกดำให้ความมั่นใจ; acid lime ใช้เฉพาะ active state/CTA; lilac ใช้เป็นสีระบบสำหรับข้อมูลเชิงวิเคราะห์
- **Layout Paradigm:** left rail แบบเครื่องมือจริง + content canvas แบบ asymmetric; dashboard hero ทางซ้ายและ preview card ทางขวา; ไม่ใช้ landing page grid แบบศูนย์กลางล้วน
- **Signature Elements:** ป้ายสถานะแบบ pill, เส้นกรอบดำหนา, preview window ที่แสดง Bot/Human split
- **Interaction Philosophy:** ทุกการสลับโหมดต้องเห็นผลทันทีใน preview; ปุ่ม primary มีข้อความชัด; การตั้งค่าที่เสี่ยงใช้พื้นที่แยกและยืนยันก่อนบันทึก
- **Animation:** fade/slide สั้น 160–220ms; preview mode switch crossfade; หลีกเลี่ยง motion ต่อเนื่องที่รบกวนการอ่านข้อมูล
- **Typography System:** IBM Plex Sans Thai เป็น UI/body; Space Grotesk สำหรับตัวเลขและ label ภาษาอังกฤษ; H1 หนา/แน่น, body 14–16px, metadata 11–12px uppercase tracking
- **Brand Essence:** command center สำหรับทีมยิงแอดที่เปลี่ยน landing page ได้โดยไม่ต้องเปิดหลายเครื่องมือ — ชัด, เร็ว, ควบคุมได้
- **Brand Voice:** ตรงและลงมือทำ เช่น “เลือกหน้าให้แคมเปญนี้” และ “ตรวจ tracking ก่อนเผยแพร่”
- **Wordmark & Logo:** สัญลักษณ์สี่เหลี่ยมซ้อน 2 ชั้นเป็นตัว A และจุด tracking สี lime; wordmark ADSHUB แบบ compact
- **Signature Brand Color:** acid lime `#D8F36A`

## Project structure
- `client/src/App.tsx` — route shell และ auth-aware application frame
- `client/src/pages/Home.tsx` — dashboard หลัก, page switcher, analytics snapshot และ activity
- `client/src/index.css` — design tokens, typography, layout utilities และ responsive rules
- `drizzle/schema.ts` — ผู้ใช้และตาราง domain ที่จะรองรับ persistence
- `server/db.ts` — data access helpers สำหรับ landing pages และ integrations
- `server/routers.ts` — tRPC procedures เมื่อเชื่อม persistence ในรอบถัดไป
- `public/manus-routes.json` — รายการ route ที่ระบบรองรับ

## Required behaviors
- มีหน้าเข้าสู่ระบบ/ปุ่มเข้าใช้งานด้วย Manus OAuth และมีสถานะผู้ใช้ใน UI
- มีเมนูจัดการ Landing Pages, Tracking Pixels, ทีม และ Settings
- มีตัวเลือกสลับหน้า “หน้าเกม / หน้า SEO” กับ “หน้าขายของ” และ preview Bot/Human
- รองรับฟอร์ม/พื้นที่ตั้งค่า Facebook Pixel, TikTok Pixel, Conversion API และ custom CSS ในระดับหน้าหรือแคมเปญ
- แสดงสถานะ draft/live/paused และสถิติ views, clicks, conversion rate
- ทำ responsive สำหรับ desktop และ mobile

## Out of scope for this first working slice
- การเผยแพร่โดเมนจริงและการยิง event ไปยัง provider จริง
- การรับชำระเงินและระบบตรวจสลิป
- การสร้างบัญชี third-party Facebook/TikTok แทนผู้ใช้
