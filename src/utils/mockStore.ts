'use client'

/**
 * StockFlow Shared Mock State Manager
 * Emulates full B2B workflow (Seller -> Host -> Buyer -> Carrier) using localStorage
 * Syncs seamlessly across browser tabs and components.
 */

export interface SharedListing {
  id: string
  product_name: string
  category_name: string
  category_id?: number
  quantity: number
  reserved_quantity?: number
  available_quantity: number
  unit: string
  unit_price: number
  condition_text: string
  location_text: string
  seller_name: string
  seller_id?: string
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'paused' | 'sold_out'
  rejection_reason?: string
  lot_number?: string
  manufacturing_date?: string
  expiry_date?: string
  document_notes?: string
  docTypes?: string
  images?: string[]
  created_at?: string
}

export interface SharedPurchaseRequest {
  id: string
  listing_id?: string
  product_name: string
  buyer_company: string
  buyer_contact?: string
  requested_quantity: number
  proposed_unit_price: number
  seller_name?: string
  status: 'submitted' | 'assigned' | 'seller_confirmed' | 'seller_rejected' | 'quoted' | 'buyer_confirmed' | 'cancelled'
  coordinator_name?: string
  shipping_fee?: number
  loading_fee?: number
  count_fee?: number
  carrier?: string
  duration_text?: string
  pickup_date?: string
  notes?: string
  created_at?: string
}

export interface SharedLogisticsTrip {
  id: string
  goods: string
  pickup: string
  pickRegion: string
  drop: string
  dropRegion: string
  weight: string
  volume: string
  truck: string
  date: string
  status: string
  distance: string
  loading: string
  count: string
  quotes?: {
    carrierName: string
    transportFee: number
    loadingFee: number
    countFee: number
    durationText: string
    pickupDate: string
    notes?: string
  }[]
  proofImages?: string[]
}

export interface SharedOrder {
  id: string
  buyer_company: string
  product_name: string
  total_amount: number
  status: 'awaiting_payment' | 'paid' | 'delivering' | 'completed' | 'cancelled'
  payment_receipt_url?: string
  created_at?: string
}

export interface SharedShipment {
  id: string
  order_id: string
  product_name: string
  buyer_company: string
  status: 'scheduled' | 'picked_up' | 'in_transit' | 'delivered' | 'completed'
  carrier: string
  notes?: string
}

const STORAGE_KEY = 'stockflow_shared_state_v2'

const INITIAL_DATA = {
  listings: [
    {
      id: 'lst-1',
      product_name: 'Thùng carton 40 × 30 × 30 cm',
      category_name: 'Bao bì và vật tư đóng gói',
      category_id: 1,
      quantity: 10000,
      available_quantity: 10000,
      unit: 'thùng',
      unit_price: 4200,
      condition_text: 'Mới 100%',
      location_text: 'Dĩ An, Bình Dương',
      seller_name: 'ABC Packaging JSC',
      status: 'approved',
      lot_number: 'SF-PK-01',
      manufacturing_date: '2026-06-01',
      expiry_date: '2027-06-01',
      document_notes: 'Có hóa đơn VAT & CO/CQ đầy đủ',
    },
    {
      id: 'lst-2',
      product_name: 'Túi giấy kraft đáy đứng',
      category_name: 'Bao bì và vật tư đóng gói',
      category_id: 1,
      quantity: 8000,
      available_quantity: 8000,
      unit: 'túi',
      unit_price: 2500,
      condition_text: 'Mới 100%',
      location_text: 'Long Thành, Đồng Nai',
      seller_name: 'Phương Nam Box',
      status: 'approved',
      lot_number: 'SF-PK-02',
      manufacturing_date: '2026-05-10',
      expiry_date: '2027-05-10',
    },
    {
      id: 'lst-3',
      product_name: 'Vải cotton màu be cuộn',
      category_name: 'Vải và phụ liệu may mặc',
      category_id: 2,
      quantity: 2000,
      available_quantity: 2000,
      unit: 'mét',
      unit_price: 65000,
      condition_text: 'Mới 98%',
      location_text: 'Tân Bình, TP.HCM',
      seller_name: 'XYZ Textile',
      status: 'approved',
      lot_number: 'SF-TEX-08',
      manufacturing_date: '2026-04-15',
      expiry_date: '2028-04-15',
    },
    {
      id: 'lst-4',
      product_name: 'Vải thun Cotton dư dôi lô sản xuất',
      category_name: 'Vải và phụ liệu may mặc',
      category_id: 2,
      quantity: 1200,
      available_quantity: 1200,
      unit: 'kg',
      unit_price: 95000,
      condition_text: 'Mới 95%',
      location_text: 'Kho Bình Dương 2',
      seller_name: 'XYZ Textile',
      status: 'pending_review',
      lot_number: 'SF-TEX-09',
      manufacturing_date: '2026-04-15',
      expiry_date: '2028-04-15',
      document_notes: 'Bản gốc hóa đơn chất lượng đầy đủ',
      docTypes: 'Hóa đơn chứng từ, Giấy chứng nhận chất lượng',
    },
    {
      id: 'lst-5',
      product_name: 'Cà phê Robusta rang mộc Đắk Lắk',
      category_name: 'Nông sản khô và thực phẩm đóng gói',
      category_id: 3,
      quantity: 500,
      available_quantity: 500,
      unit: 'kg',
      unit_price: 120000,
      condition_text: 'Mới 100%',
      location_text: 'Quận 12, TP.HCM',
      seller_name: 'Tây Nguyên Co.',
      status: 'approved',
      lot_number: 'SF-CF-01',
      manufacturing_date: '2026-05-01',
      expiry_date: '2026-11-01',
      document_notes: 'Giấy kiểm dịch vệ sinh ATTP',
    },
  ] as SharedListing[],

  requests: [
    {
      id: 'req-001',
      listing_id: 'lst-1',
      product_name: 'Thùng carton 40 × 30 × 30 cm',
      buyer_company: 'Minh Phong Retail Co.',
      requested_quantity: 2000,
      proposed_unit_price: 4200,
      seller_name: 'ABC Packaging JSC',
      status: 'quoted',
      coordinator_name: 'Admin Điều Phối',
      shipping_fee: 350000,
      loading_fee: 50000,
      count_fee: 30000,
      carrier: 'Vận tải Minh Phát',
      duration_text: '4 giờ',
      pickup_date: '2026-07-20',
    },
    {
      id: 'req-002',
      listing_id: 'lst-3',
      product_name: 'Vải cotton màu be cuộn',
      buyer_company: 'Phong Lan Food',
      requested_quantity: 500,
      proposed_unit_price: 65000,
      seller_name: 'XYZ Textile',
      status: 'seller_confirmed',
      coordinator_name: 'Admin Điều Phối',
    },
    {
      id: 'req-003',
      listing_id: 'lst-5',
      product_name: 'Cà phê Robusta rang mộc Đắk Lắk',
      buyer_company: 'Công ty Gia Phát',
      requested_quantity: 200,
      proposed_unit_price: 120000,
      seller_name: 'Tây Nguyên Co.',
      status: 'submitted',
      coordinator_name: 'Chưa có',
    },
  ] as SharedPurchaseRequest[],

  trips: [
    {
      id: 'SF-001',
      goods: '10.000 thùng carton 40x30x30',
      pickup: 'Dĩ An, Bình Dương',
      pickRegion: 'Bình Dương',
      drop: 'Thủ Đức, TP.HCM',
      dropRegion: 'TP.HCM',
      weight: '3.200 kg',
      volume: '28 m³',
      truck: 'Xe tải 5 tấn',
      date: '2026-07-20',
      status: 'Đang nhận báo giá',
      distance: '32 km',
      loading: 'Có',
      count: 'Có',
    },
    {
      id: 'SF-002',
      goods: '2.000 mét vải cotton màu be',
      pickup: 'Thủ Đức, TP.HCM',
      pickRegion: 'TP.HCM',
      drop: 'Biên Hòa, Đồng Nai',
      dropRegion: 'Đồng Nai',
      weight: '1.100 kg',
      volume: '12 m³',
      truck: 'Xe tải 1,5 tấn',
      date: '2026-07-22',
      status: 'Đang nhận báo giá',
      distance: '38 km',
      loading: 'Có',
      count: 'Không',
    },
    {
      id: 'SF-003',
      goods: '500 kg cà phê Robusta rang',
      pickup: 'Quận 12, TP.HCM',
      pickRegion: 'TP.HCM',
      drop: 'Thuận An, Bình Dương',
      dropRegion: 'Bình Dương',
      weight: '550 kg',
      volume: '5 m³',
      truck: 'Xe tải 1,5 tấn',
      date: '2026-07-23',
      status: 'Đang nhận báo giá',
      distance: '27 km',
      loading: 'Không',
      count: 'Có',
    },
    {
      id: 'SF-004',
      goods: '8.000 túi giấy kraft đáy đứng',
      pickup: 'Biên Hòa, Đồng Nai',
      pickRegion: 'Đồng Nai',
      drop: 'Dĩ An, Bình Dương',
      dropRegion: 'Bình Dương',
      weight: '900 kg',
      volume: '9 m³',
      truck: 'Xe tải 1,5 tấn',
      date: '2026-07-24',
      status: 'Đã có đối tác nhận',
      distance: '43 km',
      loading: 'Có',
      count: 'Không',
    },
  ] as SharedLogisticsTrip[],

  orders: [
    {
      id: 'ORD-001',
      buyer_company: 'Minh Phong Retail Co.',
      product_name: 'Thùng carton 40 × 30 × 30 cm',
      total_amount: 8830000,
      status: 'awaiting_payment',
    },
    {
      id: 'ORD-002',
      buyer_company: 'Phong Lan Food',
      product_name: 'Vải cotton màu be cuộn',
      total_amount: 32500000,
      status: 'paid',
    },
  ] as SharedOrder[],

  shipments: [
    {
      id: 'SHP-001',
      order_id: 'ORD-001',
      product_name: 'Thùng carton 40 × 30 × 30 cm',
      buyer_company: 'Minh Phong Retail Co.',
      status: 'scheduled',
      carrier: 'Vận tải Minh Phát',
    },
  ] as SharedShipment[],
}

export function getSharedState() {
  if (typeof window === 'undefined') return INITIAL_DATA

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA))
    return INITIAL_DATA
  }
  try {
    return JSON.parse(stored)
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA))
    return INITIAL_DATA
  }
}

export function saveSharedState(state: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('stockflow-shared-state-updated'))
}

// ── Shared Actions ─────────────────────────────────────────

export function mockAddListing(newListing: Partial<SharedListing>): SharedListing {
  const state = getSharedState()
  const listing: SharedListing = {
    id: `lst-${Date.now()}`,
    product_name: newListing.product_name || 'Hàng hóa mới',
    category_name: newListing.category_name || 'Bao bì và vật tư đóng gói',
    category_id: newListing.category_id || 1,
    quantity: newListing.quantity || 100,
    available_quantity: newListing.quantity || 100,
    unit: newListing.unit || 'cái',
    unit_price: newListing.unit_price || 0,
    condition_text: newListing.condition_text || 'Mới 100%',
    location_text: newListing.location_text || 'Kho chính',
    seller_name: newListing.seller_name || 'ABC Packaging JSC',
    status: 'pending_review',
    lot_number: newListing.lot_number,
    manufacturing_date: newListing.manufacturing_date,
    expiry_date: newListing.expiry_date,
    document_notes: newListing.document_notes,
    docTypes: newListing.docTypes,
    created_at: new Date().toISOString(),
  }
  state.listings.unshift(listing)
  saveSharedState(state)
  return listing
}

export function mockReviewListing(listingId: string, approve: boolean, reason?: string) {
  const state = getSharedState()
  const idx = state.listings.findIndex((l: any) => l.id === listingId)
  if (idx !== -1) {
    state.listings[idx].status = approve ? 'approved' : 'rejected'
    if (reason) state.listings[idx].rejection_reason = reason
    saveSharedState(state)
  }
}

export function mockCreatePurchaseRequest(req: Partial<SharedPurchaseRequest>): SharedPurchaseRequest {
  const state = getSharedState()
  const request: SharedPurchaseRequest = {
    id: `req-${Date.now()}`,
    listing_id: req.listing_id,
    product_name: req.product_name || 'Sản phẩm B2B',
    buyer_company: req.buyer_company || 'Doanh nghiệp mua sỉ',
    buyer_contact: req.buyer_contact,
    requested_quantity: req.requested_quantity || 1,
    proposed_unit_price: req.proposed_unit_price || 0,
    seller_name: req.seller_name || 'Nhà cung cấp',
    status: 'submitted',
    coordinator_name: 'Chưa có',
    created_at: new Date().toISOString(),
  }
  state.requests.unshift(request)
  saveSharedState(state)
  return request
}

export function mockUpdatePurchaseRequest(requestId: string, update: Partial<SharedPurchaseRequest>) {
  const state = getSharedState()
  const idx = state.requests.findIndex((r: any) => r.id === requestId)
  if (idx !== -1) {
    state.requests[idx] = { ...state.requests[idx], ...update }
    saveSharedState(state)
  }
}

export function mockAddLogisticsQuote(requestId: string, quoteData: {
  shipping_fee: number
  loading_fee: number
  count_fee: number
  duration_text: string
  carrier?: string
}) {
  const state = getSharedState()
  const idx = state.requests.findIndex((r: any) => r.id === requestId)
  if (idx !== -1) {
    state.requests[idx].status = 'quoted'
    state.requests[idx].shipping_fee = quoteData.shipping_fee
    state.requests[idx].loading_fee = quoteData.loading_fee
    state.requests[idx].count_fee = quoteData.count_fee
    state.requests[idx].duration_text = quoteData.duration_text
    state.requests[idx].carrier = quoteData.carrier || 'Vận tải Minh Phát'
    saveSharedState(state)
  }
}

export function mockConfirmLogisticsQuote(requestId: string) {
  const state = getSharedState()
  const req = state.requests.find((r: any) => r.id === requestId)
  if (req) {
    req.status = 'buyer_confirmed'
    
    // Auto create Order
    const totalAmount = (req.requested_quantity * req.proposed_unit_price) +
      (req.shipping_fee || 0) + (req.loading_fee || 0) + (req.count_fee || 0)
    
    const newOrder: SharedOrder = {
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      buyer_company: req.buyer_company,
      product_name: req.product_name,
      total_amount: totalAmount,
      status: 'awaiting_payment',
      created_at: new Date().toISOString(),
    }
    state.orders.unshift(newOrder)

    // Auto create Shipment
    const newShipment: SharedShipment = {
      id: `SHP-${Math.floor(100 + Math.random() * 900)}`,
      order_id: newOrder.id,
      product_name: req.product_name,
      buyer_company: req.buyer_company,
      status: 'scheduled',
      carrier: req.carrier || 'Vận tải Minh Phát',
    }
    state.shipments.unshift(newShipment)

    saveSharedState(state)
  }
}

export function mockUpdateOrderStatus(orderId: string, status: SharedOrder['status'], receiptUrl?: string) {
  const state = getSharedState()
  const order = state.orders.find((o: any) => o.id === orderId)
  if (order) {
    order.status = status
    if (receiptUrl) order.payment_receipt_url = receiptUrl
    saveSharedState(state)
  }
}

export function mockUpdateShipmentStatus(shipmentId: string, status: SharedShipment['status'], notes?: string) {
  const state = getSharedState()
  const shp = state.shipments.find((s: any) => s.id === shipmentId)
  if (shp) {
    shp.status = status
    if (notes) shp.notes = notes
    saveSharedState(state)
  }
}
