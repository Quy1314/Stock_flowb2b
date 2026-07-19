import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSharedState,
  saveSharedState,
  mockAddListing,
  mockReviewListing,
  mockCreatePurchaseRequest,
  mockUpdatePurchaseRequest,
  mockAddLogisticsQuote,
  mockConfirmLogisticsQuote,
  mockUpdateOrderStatus,
  mockAddQuoteToTrip,
  SharedState
} from '@/utils/mockStore'

describe('Full B2B Lifecycle End-to-End Integration Test', () => {
  beforeEach(() => {
    // Reset localStorage for a clean mock environment
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }
  })

  it('executes full B2B flow: Seller Listing -> Host Review -> Customer Request -> Seller Agree -> Host Quote -> Customer Confirm -> Carrier Transit', () => {
    // 1. Seller posts a new listing
    const initialListingCount = getSharedState().listings.length
    const newListing = mockAddListing({
      product_name: 'Thùng carton 5 lớp 60x40cm',
      category_name: 'Bao bì & In ấn',
      quantity: 10000,
      unit: 'thùng',
      unit_price: 15000,
      condition_text: 'Mới 100% tồn kho nhà máy',
      location_text: 'KCN Sóng Thần, Bình Dương',
      seller_name: 'Công ty Bao Bì Việt Nhật',
      lot_number: 'LOT-2026-001',
      manufacturing_date: '2026-01-10',
      expiry_date: '2028-01-10',
    })

    expect(newListing.id).toBeDefined()
    expect(newListing.status).toBe('pending_review')
    expect(getSharedState().listings.length).toBe(initialListingCount + 1)

    // 2. Host reviews and approves the seller's listing
    const approvedListing = mockReviewListing(newListing.id, true)
    expect(approvedListing?.status).toBe('approved')
    expect(approvedListing?.available_quantity).toBe(10000)

    // 3. Customer submits a purchase request for 2500 units
    const request = mockCreatePurchaseRequest({
      product_name: newListing.product_name,
      buyer_company: 'Chuỗi Siêu Thị Minimart',
      buyer_contact: '0909123456',
      requested_quantity: 2500,
      proposed_unit_price: 15000,
      seller_name: newListing.seller_name,
    })

    expect(request.id).toBeDefined()
    expect(request.status).toBe('submitted')

    // 4. Seller confirms the customer's purchase request
    const confirmedReq = mockUpdatePurchaseRequest(request.id, 'seller_confirmed')
    expect(confirmedReq?.status).toBe('seller_confirmed')

    // 5. Host adds a logistics quote (Shipping: 500,000 VND, Loading: 100,000 VND)
    const quotedReq = mockAddLogisticsQuote(
      request.id,
      500000,
      100000,
      0,
      'Vận tải Minh Phát',
      'Dự kiến giao trong 24h'
    )

    expect(quotedReq?.status).toBe('quoted')
    expect(quotedReq?.shipping_fee).toBe(500000)

    // 6. Customer approves logistics quote and converts request into an official Order
    const { request: finalReq, order } = mockConfirmLogisticsQuote(request.id)
    expect(finalReq?.status).toBe('buyer_confirmed')
    expect(order).toBeDefined()
    expect(order.total_amount).toBe((2500 * 15000) + 500000 + 100000)
    expect(order.status).toBe('awaiting_payment')

    // 7. Customer pays and Host approves payment
    const paidOrder = mockUpdateOrderStatus(order.id, 'paid')
    expect(paidOrder?.status).toBe('paid')

    // 8. Carrier updates trip status
    const initialTripCount = getSharedState().trips.length
    const state = getSharedState()
    const tripToQuote = state.trips[0]
    if (tripToQuote) {
      mockAddQuoteToTrip(tripToQuote.id, {
        carrierName: 'Vận tải Minh Phát',
        transportFee: 1200000,
        loadingFee: 200000,
        countFee: 50000,
        durationText: 'Trong ngày',
        pickupDate: '2026-07-20',
        notes: 'Xe tải 5 tấn có bạt phủ',
      })

      const updatedState = getSharedState()
      const updatedTrip = updatedState.trips.find(t => t.id === tripToQuote.id)
      expect(updatedTrip?.status).toBe('Đã báo giá')
      expect(updatedTrip?.quotes?.length).toBeGreaterThan(0)
    }

    // Verify overall state consistency
    const endState = getSharedState()
    const foundListing = endState.listings.find(l => l.id === newListing.id)
    expect(foundListing?.status).toBe('approved')
  })
})
