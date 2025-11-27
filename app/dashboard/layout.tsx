// app/dashboard/layout.tsx
"use client"
import React from "react"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-10/12 flex grow flex-col">
        <Header />

        <main className="w-full grow p-0 bg-slate-100 max-w-(--breakpoint-xl)">
          {children}
        </main>
      </div>
    </div>
  )
}
