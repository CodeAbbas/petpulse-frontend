'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export interface LoginResult {
  error?: string
}

/**
 * Authenticate a vet/admin against the Laravel Sanctum API.
 * On success, sets an httpOnly `petpulse_token` cookie and redirects to /.
 * The httpOnly flag means client JS cannot read the token — it is only
 * forwarded by the browser to Next.js Server Components and Actions.
 */
export async function loginAction(
  _prev: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password, device_name: 'vet-portal' }),
      cache: 'no-store',
    })
  } catch {
    return { error: 'Cannot reach the API. Check the server is running.' }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string }
    return { error: body.message ?? 'Invalid credentials.' }
  }

  const body = await res.json() as { data: { token: string } }
  const token = body.data.token

  const store = await cookies()
  store.set('petpulse_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  redirect('/')
}

/**
 * Revoke the Sanctum token on the server, then clear the cookie.
 */
export async function logoutAction(): Promise<void> {
  const store = await cookies()
  const token = store.get('petpulse_token')?.value

  if (token) {
    // Best-effort revocation — ignore network failures on logout.
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    }).catch(() => {})
  }

  store.delete('petpulse_token')
  redirect('/login')
}