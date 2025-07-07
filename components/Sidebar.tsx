// components/Sidebar.tsx
import Link from 'next/link'

export default function Sidebar() {
  const sidebarMenu = [
    {link: '/dashboard', label: 'dashboard'},
    {link: '/dashboard/users', label: 'users'},
    {link: '/dashboard/categories', label: 'categories'},
    {link: '/dashboard/plagiarism-tools', label: 'plagiarism tools'},
    {link: '/dashboard/simple_ai', label: 'simple ai'},
    {link: '/dashboard/settings', label: 'settings'},
  ]
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
          {sidebarMenu.map((items, key) => (
            <li style={{ marginBottom: '15px' }} key={`sidebarmenu-${key}`}>
              <Link href={items.link} className='text-white no-underline text-md capitalize'>
                {items.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}