import { describe, it, expect, vi, beforeEach } from 'vitest'
import { middleware } from '@/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Mock next/server
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    NextResponse: {
      next: vi.fn().mockReturnValue({ status: 'next' }),
      redirect: vi.fn().mockImplementation((url) => ({ status: 'redirect', url: url.toString() })),
    },
  }
})

// Mock Supabase server client
const mockGetUser = vi.fn()
const mockSelect = vi.fn()

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSelect,
        }),
      }),
    }),
  })),
}))

describe('Middleware Router Guard (Story 1.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login if user is unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('No session') })

    const req = new NextRequest('http://localhost:3000/dashboard/seller')
    const res = await middleware(req)

    expect(res).toBeDefined()
    expect(NextResponse.redirect).toHaveBeenCalled()
    // It should redirect to login page
    expect((res as any).url).toContain('/login')
  })

  it('redirects to /login with error if customer attempts to access host dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockSelect.mockResolvedValue({ data: { role: 'customer' } })

    const req = new NextRequest('http://localhost:3000/dashboard/host')
    const res = await middleware(req)

    expect(res).toBeDefined()
    expect(NextResponse.redirect).toHaveBeenCalled()
    expect((res as any).url).toContain('/login')
  })

  it('allows access to dashboard/customer if user role is customer', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockSelect.mockResolvedValue({ data: { role: 'customer' } })

    const req = new NextRequest('http://localhost:3000/dashboard/customer')
    const res = await middleware(req)

    expect(res).toBeDefined()
    expect(NextResponse.next).toHaveBeenCalled()
    expect((res as any).status).toBe('next')
  })
})
