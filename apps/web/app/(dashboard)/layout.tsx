import { RoleProvider } from '@/components/role-context'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { currentUser } from '@/lib/mock-data'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleProvider user={currentUser}>
      <div className="min-h-screen">
        <Sidebar />
        <div className="pl-60">
          <Topbar />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </RoleProvider>
  )
}
