// app/dashboard/layout.tsx
import React from "react"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[100vh]">
      <Sidebar />

      <div className="w-10/12 flex flex-grow flex-col">
        <Header />

        <main className="w-full flex-grow p-0 bg-slate-100 max-w-screen-xl">
          {children}
        </main>
      </div>
    </div>
  )
}
