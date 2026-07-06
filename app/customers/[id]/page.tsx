export default function CustomerDetailPage() {
  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        📋 บริษัท ABC จำกัด
      </h1>

      <div className="grid grid-cols-2 gap-8">

        <div className="border rounded-xl p-5">
          <h2 className="font-bold text-xl mb-4">
            ข้อมูลบริษัท
          </h2>

          <p>รหัส : C001</p>
          <p>เลขผู้เสียภาษี : 0123456789012</p>
          <p>เบอร์โทร : 0812345678</p>
          <p>Email : abc@gmail.com</p>
          <p>ผู้ติดต่อ : คุณสมชาย</p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="font-bold text-xl mb-4">
            ค่าบริการ
          </h2>

          <p>ค่าบริการ : 3,000 บาท</p>
          <p>ผู้รับผิดชอบ : Nine</p>
          <p>สถานะ : 🟢 ใช้งาน</p>
        </div>

      </div>

    </main>
  );
}