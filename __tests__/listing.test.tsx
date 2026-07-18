import { describe, it, expect, vi } from 'vitest'
import { createListing, getListings, reviewListing } from '@/app/actions/listing'

// Mock the Supabase server client
const mockInsertSingle = vi.fn()
const mockInsertSelect = vi.fn().mockReturnValue({
  single: mockInsertSingle
})
const mockInsert = vi.fn().mockReturnValue({
  select: mockInsertSelect
})
const mockSelect = vi.fn()
let mockListingsData: any[] = []
const mockEq = vi.fn().mockImplementation(() => {
  return {
    single: mockSelect,
    then: (resolve: any) => resolve({ data: mockListingsData, error: null })
  }
})
const mockUpload = vi.fn()
const mockRpc = vi.fn()

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'seller-123' } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: mockEq,
      }),
      insert: mockInsert,
    }),
    rpc: mockRpc,
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockUpload,
      }),
    },
  })),
}))

describe('Listing Actions (Story 2.1)', () => {
  it('creates listing successfully with valid inputs and checked commitment', async () => {
    mockSelect.mockResolvedValue({ data: { organization_id: 'org-123', role: 'seller' } })
    mockInsertSingle.mockResolvedValue({ data: { id: 'listing-123' }, error: null })

    const res = await createListing({
      productName: 'Lô thùng carton cũ',
      categoryId: 1,
      warehouseId: 'warehouse-123',
      quantity: 100,
      unit: 'cái',
      unitPrice: 5000,
      conditionText: 'Mới 95%',
      manufacturingDate: '2026-01-01',
      expiryDate: '2027-01-01',
      locationText: 'Kho Hà Nội',
      description: 'Mô tả ngắn',
      isCommitted: true,
    })

    expect(res.success).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      product_name: 'Lô thùng carton cũ',
      seller_id: 'seller-123',
      seller_organization_id: 'org-123',
      status: 'pending_review',
    }))
  })

  it('fails to create listing if truthfulness commitment is unchecked', async () => {
    const res = await createListing({
      productName: 'Lô thùng carton cũ',
      categoryId: 1,
      warehouseId: 'warehouse-123',
      quantity: 100,
      unit: 'cái',
      unitPrice: 5000,
      conditionText: 'Mới 95%',
      isCommitted: false,
    })

    expect(res.success).toBe(false)
    expect(res.error).toContain('cam kết thông tin đúng sự thật')
  })

  it('retrieves listings successfully for the authenticated seller', async () => {
    mockListingsData = [{ id: 'listing-123', product_name: 'Carton box' }]

    const res = await getListings()
    expect(res).toBeDefined()
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(1)
    expect(res[0].product_name).toBe('Carton box')
  })

  it('reviews listing successfully as a host', async () => {
    // User is host
    mockSelect.mockResolvedValue({ data: { role: 'host' } })
    mockRpc.mockResolvedValue({ data: { id: 'listing-123', status: 'approved' }, error: null })

    const res = await reviewListing('listing-123', true)
    expect(res.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('host_review_listing', {
      p_listing_id: 'listing-123',
      p_approve: true,
      p_reason: undefined,
    })
  })
})

