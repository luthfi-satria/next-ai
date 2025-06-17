// app/dashboard/users/page.tsx
export default function UsersPage() {
  return (
    <div>
      <h1>Manajemen Pengguna</h1>
      <p>Daftar pengguna Anda akan ditampilkan di sini.</p>
      {/* Contoh tabel pengguna */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nama</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>John Doe</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>john.doe@example.com</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Admin</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Jane Smith</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>jane.smith@example.com</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>User</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}