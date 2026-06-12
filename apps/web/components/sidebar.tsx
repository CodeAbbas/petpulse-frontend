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
  X,
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

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const { user, role } = useRole()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/10 bg-background/95 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:bg-white/5 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="font-heading text-base font-semibold">PetPulse</p>
              <p className="text-[11px] text-muted-foreground">Clinic OS</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
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
                onClick={onClose} // Auto-close on mobile
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
    </>
  )
}