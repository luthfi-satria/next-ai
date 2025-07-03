// components/Sidebar.tsx
import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside style={{
      width: '250px',
      background: '#343a40',
      color: 'white',
      padding: '20px',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Admin Panel</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
              Dashboard
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link href="/dashboard/users" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
              Users
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link href="/dashboard/plagiarism-tools" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
              Plagiarism tools
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link href="/dashboard/settings" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
              Settings
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link href="/dashboard/simple_ai" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
              Simple AI
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}