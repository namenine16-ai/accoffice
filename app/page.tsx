export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🏢 ระบบสำนักงานบัญชี</h1>

      <h2>Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>👥 ลูกค้า</h3>
          <h1>125</h1>
        </div>

        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>📅 งานวันนี้</h3>
          <h1>18</h1>
        </div>

        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>⏰ งานค้าง</h3>
          <h1>7</h1>
        </div>

        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>⚠️ ใกล้ครบกำหนด</h3>
          <h1>9</h1>
        </div>

        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>💰 รายได้เดือนนี้</h3>
          <h1>250,000</h1>
        </div>

        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>📈 รายได้ปีนี้</h3>
          <h1>2,850,000</h1>
        </div>
      </div>
    </main>
  );
}