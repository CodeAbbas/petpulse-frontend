'use client'

import { createContext, useContext, useState } from 'react'
import type { CurrentUser, Role } from '@/lib/types'

interface RoleContextValue {
  user: CurrentUser
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({
  user,
  children,
}: {
  user: CurrentUser
  children: React.ReactNode
}) {
  const [role, setRole] = useState<Role>(user.role)
  return (
    <RoleContext.Provider value={{ user: { ...user, role }, role, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
