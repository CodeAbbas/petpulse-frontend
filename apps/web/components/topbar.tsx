'use client'

import { Search, Bell, Menu } from 'lucide-react'
import { useRole } from '@/components/role-context'
import { cn } from '@/lib/utils'

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { role, setRole } = useRole()

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
          aria-label="Notifications, 2 unread"
          className="relative flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-[18px]" aria-hidden="true" />
          <span className="absolute right-2 top-2 flex size-2 items-center justify-center">
            <span className="absolute inline-flex size-2 animate-ping rounded-full bg-critical/70" />
            <span className="relative inline-flex size-2 rounded-full bg-critical" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRole(role === 'admin' ? 'vet' : 'admin')}
          aria-label={`Current role ${role}. Switch role.`}
          title="Switch role (demo)"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
            role === 'admin'
              ? 'border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20'
              : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              role === 'admin' ? 'bg-secondary' : 'bg-primary',
            )}
          />
          {role}
        </button>
      </div>
    </header>
  )
}