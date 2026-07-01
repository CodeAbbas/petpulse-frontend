'use client'

import { useState } from 'react'
import { RoleProvider } from '@/components/role-context'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import type { CurrentUser } from '@/lib/types'

/**
 * Client wrapper that owns the sidebar open/close state.
 * Extracted so the parent DashboardLayout can be a Server Component
 * (and therefore read cookies + fetch the authenticated user).
 */
export function DashboardShell({
  user,
  children,
}: {
  user: CurrentUser
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <RoleProvider user={user}>
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-h-screen flex-col md:pl-60">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleProvider>
  )
}