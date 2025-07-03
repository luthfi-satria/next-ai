// app/dashboard/layout.tsx
import Sidebar from '../../components/Sidebar' 
import Header from '../../components/Header'
import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flexGrow: 1, padding: '0px', background: '#f8f9fa' }}>
          {children}
        </main>
      </div>
    </div>
  )
}