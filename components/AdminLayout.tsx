// components/AdminLayout.tsx
import React from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flexGrow: 1 }}>
        <Header />
        <main style={{ padding: "20px" }}>{children}</main>
      </div>
    </div>
  )
}
