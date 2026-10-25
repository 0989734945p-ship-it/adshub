# AdsHub TODO

## Dashboard shell and navigation
- [ ] ระบบมีแผงจัดการภายในภาษาไทย พร้อมเมนู Landing Pages, Tracking Pixels, ทีม และ Settings
- [ ] แดชบอร์ดแสดงสถานะรวมของหน้า จำนวน views, clicks, conversions และกิจกรรมล่าสุด
- [ ] หน้าจอ responsive และมี active navigation ที่เห็นได้ชัด

## Authentication and team access
- [ ] มีหน้า/ปุ่มเข้าสู่ระบบสำหรับผู้ดูแลและผู้ใช้ภายในผ่าน Manus OAuth จริง
- [ ] แสดงชื่อ/สถานะผู้ใช้เมื่อเข้าสู่ระบบ และมีปุ่มออกจากระบบ
- [ ] ผู้ดูแลมีพื้นที่สำหรับสร้าง แก้ไข และปิดใช้งานบัญชีทีมใน UI โดยไม่เปิดเผย credential หรือ token ใน frontend

## Landing page management
- [ ] แสดงรายการ Landing Page พร้อมชื่อ slug ประเภท สถานะ และสถิติ
- [ ] รองรับการสร้าง คัดลอก แก้ไข ลบ และสลับหน้าแต่ละรายการจากภายในระบบ
- [ ] รองรับประเภทหน้าเกม/SEO และหน้าขายของ พร้อม preview Bot/Human ที่เปรียบเทียบได้
- [ ] มีสถานะ draft, live และ paused และมีทางลัดสำหรับเปิดดู/แก้ไข/เผยแพร่

## Tracking and customization
- [ ] ตั้งค่า Facebook Pixel และ TikTok Pixel แยกตาม Landing Page พร้อม pixel ID และ events
- [ ] ตั้งค่า Pixel API/Conversion API พร้อมโทเคนและข้อมูลเชื่อมต่อในพื้นที่ปลอดภัย
- [ ] มีพื้นที่ custom CSS รายหน้าและ preview ก่อนเผยแพร่
- [ ] จัดการข้อมูลแคมเปญ TikTok/Facebook และเชื่อมโยงกับหน้าที่เลือก

## Delivery
- [ ] มี `/manus-routes.json` ที่สะท้อน route จริงของแอป
- [ ] ผ่าน typecheck/build และตรวจ readiness ของ dev server
- [ ] เตรียม checkpoint ผ่าน Git หลังตรวจโค้ดเรียบร้อย
