import { describe, it, expect, vi } from 'vitest'
import { submitLogisticsQuote, approveLogisticsQuote, updateShipmentStatus, confirmDelivery, submitPaymentReceipt, confirmPaymentReceipt } from '@/app/actions/logistics'
import * as supabaseServer from '@/utils/supabase/server'

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
    expect(mockRpc).toHaveBeenCalledWith('host_add_logistics_quote', {
      p_request_id: 'req-123',
      p_logistics_partner_id: '00000000-0000-0000-0000-000000000000',
      p_shipping_fee: 150000,
      p_loading_fee: 0,
      p_count_fee: 0,
      p_duration_text: null,
      p_note: null,
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

  it('submits payment receipt successfully as customer', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'customer-123' } } })
    // Mock the chainable database call for upsert and update
    // Instead of mockRpc, here we use direct table upsert, so let's mock it
    const mockUpsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'payment-123' }, error: null })
      })
    })
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    })
    
    // Temporarily mock supabase methods
    const mockClientInstance = {
      auth: { getUser: mockGetUser },
      from: vi.fn().mockImplementation((table) => {
        if (table === 'payments') {
          return { upsert: mockUpsert }
        }
        if (table === 'orders') {
          return { update: mockUpdate }
        }
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { role: 'customer' } }) }) }) }
      })
    }
    
    vi.spyOn(supabaseServer, 'createClient').mockResolvedValue(mockClientInstance as any)
    
    const res = await submitPaymentReceipt('order-123', 500000, 'receipts/slip.jpg')
    expect(res.success).toBe(true)
  })

  it('confirms payment receipt successfully as host', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'host-123' } } })
    const mockUpdatePayment = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'payment-123', order_id: 'order-123' }, error: null })
        })
      })
    })
    const mockUpdateOrder = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    })
    
    const mockClientInstance = {
      auth: { getUser: mockGetUser },
      from: vi.fn().mockImplementation((table) => {
        if (table === 'profiles') {
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { role: 'host' } }) }) }) }
        }
        if (table === 'payments') {
          return { update: mockUpdatePayment }
        }
        if (table === 'orders') {
          return { update: mockUpdateOrder }
        }
        return {}
      })
    }
    
    vi.spyOn(supabaseServer, 'createClient').mockResolvedValue(mockClientInstance as any)
    
    const res = await confirmPaymentReceipt('payment-123')
    expect(res.success).toBe(true)
  })
})
