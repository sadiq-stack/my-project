/**
 * Supabase Client Utilities
 * Location: /lib/supabase/client.ts
 * Purpose: Provides Supabase client instances for browser and server-side operations
 * with proper SSR support for Next.js 14 App Router. Ensures secure and efficient
 * database access following Vercel deployment best practices.
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components
 * This client is used in the browser environment only
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

