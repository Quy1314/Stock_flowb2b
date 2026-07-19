import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isSupabaseConfigured } from '@/utils/envCheck'

export async function createClient() {
  const cookieStore = await cookies()

  const url = isSupabaseConfigured()
    ? process.env.NEXT_PUBLIC_SUPABASE_URL!
    : 'https://placeholder.supabase.co'
  const key = isSupabaseConfigured()
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    : 'placeholder-anon-key'

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignores headers modification errors inside server components
        }
      },
    },
  })
}
