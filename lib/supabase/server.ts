/**
 * Supabase Server Utilities
 * Location: /lib/supabase/server.ts
 * Purpose: Provides Supabase client for server-side operations (Server Components,
 * Server Actions, Route Handlers) with cookie-based session management.
 * Ensures secure authentication with SSR support for Vercel deployment.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components and Server Actions
 * Handles cookie-based session management for authentication
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component
            // This can be ignored if you have middleware refreshing
            // user sessions
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component
            // This can be ignored if you have middleware refreshing
            // user sessions
          }
        },
      },
    }
  )
}

