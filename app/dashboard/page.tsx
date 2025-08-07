// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Selamat Datang di Dashboard!</h1>
      <p>
        Ini adalah halaman utama dashboard Anda. Anda bisa menambahkan
        statistik, ringkasan, atau widget di sini.
      </p>
      {/* Contoh konten dashboard */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            background: "white",
          }}
        >
          <h3>Total Users</h3>
          <p>1,234</p>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            background: "white",
          }}
        >
          <h3>Active Products</h3>
          <p>567</p>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            background: "white",
          }}
        >
          <h3>Recent Sales</h3>
          <p>$12,345</p>
        </div>
      </div>
    </div>
  )
}
