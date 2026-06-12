'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  PawPrint,
  HeartPulse,
  Bell,
  CalendarDays,
  Users,
  Building2,
  ServerCog,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole } from '@/components/role-context'
import type { Role } from '@/lib/types'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['vet', 'admin'] },
  { label: 'Patients', href: '/patients', icon: PawPrint, roles: ['vet', 'admin'] },
  {
    label: 'Health Records',
    href: '/health-records',
    icon: HeartPulse,
    roles: ['vet', 'admin'],
  },
  { label: 'Alerts', href: '/alerts', icon: Bell, roles: ['vet'] },
  { label: 'Schedule', href: '/schedule', icon: CalendarDays, roles: ['vet'] },
  { label: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { label: 'Clinics', href: '/clinics', icon: Building2, roles: ['admin'] },
  { label: 'System', href: '/system', icon: ServerCog, roles: ['admin'] },
]

function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, role } = useRole()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <HeartPulse className="size-5" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="font-heading text-base font-semibold">PetPulse</p>
          <p className="text-[11px] text-muted-foreground">Clinic OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {items.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground',
                active &&
                  'border-l-primary bg-primary/10 text-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-mono text-xs font-semibold text-primary-foreground">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs capitalize text-muted-foreground">{role}</p>
          </div>
          <button
            type="button"
            aria-label="Log out"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-critical"
          >
            <LogOut className="size-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
