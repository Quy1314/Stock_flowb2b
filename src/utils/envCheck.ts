/**
 * Utility to check if Supabase environment variables are properly configured.
 */

export function isSupabaseConfigured(): boolean {
  // During automated unit testing (Vitest), mock clients are expected to run
  if (process.env.NODE_ENV === 'test') return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return false
  if (url === 'your_supabase_url_here' || key === 'your_supabase_anon_key_here') return false
  if (!url.startsWith('http')) return false

  return true
}
