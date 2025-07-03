// components/AdminLayout.tsx
import Sidebar from './Sidebar'
import Header from './Header'
import React from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flexGrow: 1 }}>
        <Header />
        <main style={{ padding: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}