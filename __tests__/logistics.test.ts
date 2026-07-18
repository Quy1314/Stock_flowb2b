import { describe, it, expect, vi } from 'vitest'
import { submitLogisticsQuote, approveLogisticsQuote, updateShipmentStatus, confirmDelivery } from '@/app/actions/logistics'

// Mock the Supabase server client
const mockRpc = vi.fn()
const mockSelect = vi.fn()
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'host-123' } } })

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
    rpc: mockRpc,
  })),
}))

describe('Logistics (Story 4.1)', () => {
  it('submits logistics quote successfully as host', async () => {
    mockSelect.mockResolvedValue({ data: { role: 'host' } })
    mockRpc.mockResolvedValue({ data: { id: 'req-123', status: 'quote_provided' }, error: null })

    const res = await submitLogisticsQuote('req-123', 150000)
    expect(res.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('host_submit_logistics_quote', {
      p_request_id: 'req-123',
      p_shipping_fee: 150000,
    })
  })

  it('approves logistics quote successfully as customer', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'customer-123' } } })
    mockSelect.mockResolvedValue({ data: { role: 'customer' } })
    mockRpc.mockResolvedValue({ data: { id: 'req-123', status: 'quote_approved' }, error: null })

    const res = await approveLogisticsQuote('req-123')
    expect(res.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('customer_approve_logistics_quote', {
      p_request_id: 'req-123',
    })
  })

  it('updates shipment status successfully as host (Story 4.4)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'host-123' } } })
    mockSelect.mockResolvedValue({ data: { role: 'host' } })
    mockRpc.mockResolvedValue({ data: { id: 'shipment-123', status: 'in_transit' }, error: null })

    const res = await updateShipmentStatus('shipment-123', 'in_transit', 'Đã xuất kho')
    expect(res.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('host_update_shipment_status', {
      p_shipment_id: 'shipment-123',
      p_status: 'in_transit',
      p_notes: 'Đã xuất kho',
    })
  })

  it('confirms delivery successfully as host (Story 4.4)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'host-123' } } })
    mockSelect.mockResolvedValue({ data: { role: 'host' } })
    mockRpc.mockResolvedValue({ data: { id: 'shipment-123', status: 'delivered' }, error: null })

    const res = await confirmDelivery('shipment-123')
    expect(res.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('host_confirm_delivery', {
      p_shipment_id: 'shipment-123',
    })
  })
})
