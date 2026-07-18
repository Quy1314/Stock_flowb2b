import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect routes under /dashboard
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // 1. Developer Mock Role Bypass Check
  const mockRoleCookie = request.cookies.get('sb-mock-role')?.value
  if (mockRoleCookie && ['seller', 'customer', 'host', 'carrier'].includes(mockRoleCookie)) {
    const pathParts = pathname.split('/')
    const dashboardNamespace = pathParts[2] // Index 2 corresponds to seller/customer/host

    if (dashboardNamespace && dashboardNamespace !== mockRoleCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // 2. Real Auth Session Check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Unauthenticated redirect
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'auth_required')
    return NextResponse.redirect(url)
  }

  // 3. Fetch user profile role from DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  if (!role) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'profile_not_found')
    return NextResponse.redirect(url)
  }

  // 4. Namespace path checks
  const pathParts = pathname.split('/')
  const dashboardNamespace = pathParts[2]

  if (dashboardNamespace && dashboardNamespace !== role) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
