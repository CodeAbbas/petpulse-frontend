import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard-shell'
import type { CurrentUser } from '@/lib/types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function fetchCurrentUser(token: string): Promise<CurrentUser | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const body = await res.json() as {
      data: { user: { id: string; name: string; role: string } }
    }
    const u = body.data?.user
    if (!u) return null
    return {
      id: u.id,
      name: u.name,
      role: u.role as CurrentUser['role'],
    }
  } catch {
    return null
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('petpulse_token')?.value

  if (!token) {
    redirect('/login')
  }

  const user = await fetchCurrentUser(token)

  if (!user) {
    // Token present but rejected by the API (expired or revoked).
    // The middleware can't detect this cheaply, so we handle it here.
    redirect('/login')
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  )
}