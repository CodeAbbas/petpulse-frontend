'use client'

import { useState } from 'react'
import { RoleProvider } from '@/components/role-context'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { currentUser } from '@/lib/mock-data'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <RoleProvider user={currentUser}>
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-h-screen flex-col md:pl-60">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          {/* overflow-x-hidden on main ensures the page doesn't scroll horizontally, only the tables do */}
          <main className="flex-1 overflow-x-hidden p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleProvider>
  )
}