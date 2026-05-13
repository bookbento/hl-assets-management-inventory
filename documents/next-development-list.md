# รายการสิ่งที่ควรพัฒนาต่อ

สรุปจากโครงเว็บปัจจุบันเพื่อใช้วางแผนงานต่อในระบบ IT Assets Inventory

## ลำดับความสำคัญ

1. ทำระบบ `Tickets` ให้ใช้งานจริง
- ตอนนี้หน้า tickets ยังเป็น mock data
- ควรมี create / assign / approve / reject / comment / status flow
- เพิ่ม attachment และประวัติการทำงานของ ticket

2. ทำระบบ `Licenses` ให้เชื่อม backend จริง
- ตอนนี้หน้า licenses ยังเป็น mock data
- ควรมี CRUD, seat assignment, วันหมดอายุ, vendor, ค่าใช้จ่าย
- เพิ่มแจ้งเตือน license ใกล้หมดอายุและ seat ใกล้เต็ม

3. ทำ Asset lifecycle ให้ครบ
- เพิ่มสถานะการใช้งาน asset ให้ชัดเจน เช่น assigned, in use, maintenance, retired
- เก็บประวัติการย้ายเครื่อง คืนเครื่อง และซ่อมเครื่อง
- ใช้ข้อมูลเดิมจาก `Employee_Assets` ให้เกิดประโยชน์มากขึ้น

4. เพิ่มแจ้งเตือนและ audit log
- แจ้งเตือน asset ใกล้หมด warranty
- แจ้งเตือน license ใกล้หมดอายุ
- เก็บ log ว่าใครสร้าง แก้ไข หรือลบข้อมูลอะไร

5. ขยาย search, filter, export
- เพิ่ม filter ตาม department, business unit, status, และช่วงวันที่
- เพิ่ม preset view สำหรับผู้ใช้แต่ละกลุ่ม
- ทำ export CSV / PDF ให้ละเอียดขึ้น

6. ทำ `Settings` ให้บันทึกข้อมูลจริง
- ตอนนี้หน้า settings ยังเป็น static UI
- ควรให้แก้ profile, password, notification preference, และสิทธิ์การใช้งานได้
- ถ้าจะไปทาง enterprise ควรมี 2FA และ session management

## ข้อแนะนำ

- ถ้าจะทำแค่เรื่องเดียวก่อน แนะนำเริ่มจาก `Tickets`
- เหตุผลคือเป็น workflow สำคัญ และยังไม่มี backend รองรับ
- ทำแล้วจะช่วยให้ระบบดูเป็น production-ready มากขึ้นทันที

