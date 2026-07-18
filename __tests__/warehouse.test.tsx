import { describe, it, expect, vi } from 'vitest'
import { createWarehouse } from '@/app/actions/warehouse'

// We will mock the supabase client in the action instead of the action itself,
// so that we test the real action logic!
// Mock the supabase server client
const mockInsert = vi.fn()
const mockSelect = vi.fn()

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSelect,
        }),
      }),
      insert: mockInsert,
    }),
  })),
}))

describe('Warehouse Actions (Story 1.4)', () => {
  it('creates warehouse successfully with valid inputs', async () => {
    // Mock user has profile with organization_id
    mockSelect.mockResolvedValue({ data: { organization_id: 'org-123' } })
    mockInsert.mockResolvedValue({ data: { id: 'warehouse-123' }, error: null })

    const res = await createWarehouse({
      name: 'Kho Hà Nội 1',
      phone: '0987654321',
      address: '123 Đường Láng',
      city: 'Hà Nội',
    })

    expect(res.success).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'Kho Hà Nội 1',
      phone: '0987654321',
      address: '123 Đường Láng',
      city: 'Hà Nội',
      organization_id: 'org-123',
    })
  })

  it('fails if user does not have a linked organization', async () => {
    mockSelect.mockResolvedValue({ data: { organization_id: null } })

    const res = await createWarehouse({
      name: 'Kho Hà Nội 1',
      phone: '0987654321',
      address: '123 Đường Láng',
      city: 'Hà Nội',
    })

    expect(res.success).toBe(false)
    expect(res.error).toContain('chưa liên kết với doanh nghiệp')
  })
})
