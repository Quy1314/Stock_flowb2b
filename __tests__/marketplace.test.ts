import { describe, it, expect, vi } from 'vitest'
import { getMarketplaceListings, createPurchaseRequest, assignCoordinator, respondPurchaseRequest } from '@/app/actions/marketplace'

// Mock the Supabase server client
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'buyer-123' } } })
const mockInsert = vi.fn()
const mockRpc = vi.fn()
let mockMarketplaceData: any[] = []
let mockProfileData: any = { role: 'customer', organization_id: 'org-buyer' }

const mockFrom = vi.fn().mockImplementation((tableName) => {
  if (tableName === 'purchase_requests') {
    return {
      insert: mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'req-123' }, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'req-123', status: 'in_negotiation' }, error: null })
          })
        })
      })
    }
  }

  const chain: any = {
    ilike: vi.fn().mockImplementation(() => chain),
    eq: vi.fn().mockImplementation(() => {
      const subChain = {
        single: vi.fn().mockImplementation(() => {
          if (tableName === 'listings') {
            return Promise.resolve({ data: { id: 'listing-123', available_quantity: 50, status: 'approved' }, error: null })
          }
          if (tableName === 'profiles') {
            return Promise.resolve({ data: mockProfileData, error: null })
          }
          return Promise.resolve({ data: null, error: null })
        }),
        then: (resolve: any) => resolve({ data: tableName === 'marketplace_listings' ? mockMarketplaceData : [], error: null })
      }
      return subChain
    }),
    then: (resolve: any) => resolve({ data: tableName === 'marketplace_listings' ? mockMarketplaceData : [], error: null })
  }

  return {
    select: vi.fn().mockReturnValue(chain)
  }
})

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

describe('Marketplace & Purchase Requests (Story 3.1 & 3.2)', () => {
  it('retrieves marketplace listings successfully', async () => {
    mockMarketplaceData = [{ id: 'listing-123', product_name: 'Lô bao bì carton', available_quantity: 50 }]

    const res = await getMarketplaceListings()
    expect(res).toBeDefined()
    expect(res.length).toBe(1)
    expect(res[0].product_name).toBe('Lô bao bì carton')
  })

  it('creates purchase request successfully with valid quantity', async () => {
    const res = await createPurchaseRequest({
      listingId: 'listing-123',
      requestedQuantity: 20,
      proposedUnitPrice: 4000,
      buyerWarehouseId: 'warehouse-buyer-123',
      buyerNote: 'Giao hàng nhanh',
    })
    expect(res.success).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      listing_id: 'listing-123',
      requested_quantity: 20,
      buyer_warehouse_id: 'warehouse-buyer-123',
    }))
  })

  it('fails to create purchase request if quantity exceeds available stock', async () => {
    const res = await createPurchaseRequest({
      listingId: 'listing-123',
      requestedQuantity: 100, // Exceeds available stock (50)
      proposedUnitPrice: 4000,
      buyerWarehouseId: 'warehouse-buyer-123',
    })
    expect(res.success).toBe(false)
    expect(res.error).toContain('vượt quá số lượng khả dụng')
  })

  it('assigns coordinator successfully as host', async () => {
    // User is host
    mockGetUser.mockResolvedValue({ data: { user: { id: 'host-111' } } })
    mockProfileData = { role: 'host' }

    const res = await assignCoordinator('req-123', 'host-222')
    expect(res.success).toBe(true)
  })

  it('seller responds to purchase request successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'seller-123' } } })
    mockProfileData = { role: 'seller' }
    mockRpc.mockResolvedValue({ data: { id: 'req-123', status: 'approved' }, error: null })

    const res = await respondPurchaseRequest('req-123', true)
    expect(res.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('seller_respond_purchase_request', {
      p_request_id: 'req-123',
      p_approve: true,
      p_reason: undefined,
    })
  })
})
