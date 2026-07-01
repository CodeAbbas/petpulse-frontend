'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'

/**
 * Vet-portal login page. Uses React 19's useActionState (progressive
 * enhancement — works without JS too since the form action is a server
 * action). On success the action sets the httpOnly cookie and redirects
 * to the dashboard.
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {})

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            PetPulse
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Veterinary Portal — Clinical Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-6 text-lg font-semibold">Sign in</h2>

          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vet@clinic.com"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Owner access is via the PetPulse mobile application.
          </p>
        </div>
      </div>
    </div>
  )
}