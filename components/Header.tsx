// components/Header.tsx
export default function Header() {
  return (
    <header style={{
      background: '#ffffff',
      padding: '20px',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }}>
      <h1 style={{ margin: 0, fontSize: '1.5em' }}>Dashboard Overview</h1>
      <div>
        <span style={{ marginRight: '10px' }}>Welcome, Admin!</span>
        <button style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </div>
    </header>
  )
}