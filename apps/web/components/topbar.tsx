'use client'

import { Search, Bell, Menu, LogOut } from 'lucide-react'
import { useRole } from '@/components/role-context'
import { logoutAction } from '@/app/login/actions'
import { cn } from '@/lib/utils'

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, role } = useRole()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/10 bg-background/60 px-4 backdrop-blur-xl md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:flex">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search patients, records, owners…"
          aria-label="Global search"
          className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-[18px]" aria-hidden="true" />
        </button>

        {/* Authenticated user badge */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize',
            role === 'admin'
              ? 'border-secondary/30 bg-secondary/10 text-secondary'
              : 'border-primary/30 bg-primary/10 text-primary',
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              role === 'admin' ? 'bg-secondary' : 'bg-primary',
            )}
          />
          {user.name} · {role}
        </div>

        {/* Logout — uses a Server Action via form so no client-side fetch needed */}
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="size-[18px]" aria-hidden="true" />
          </button>
        </form>
      </div>
    </header>
  )
}