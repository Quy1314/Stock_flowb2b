'use client'

import React, { useEffect, useState } from 'react'
import { getMarketplaceListings, createPurchaseRequest } from '@/app/actions/marketplace'
import { approveLogisticsQuote, submitPaymentReceipt } from '@/app/actions/logistics'
import { getWarehouses } from '@/app/actions/warehouse'
import { uploadPaymentReceipt } from '@/app/actions/storage'
import { createClient as createBrowserClient } from '@/utils/supabase/client'

// Mock Data Fallbacks
const MOCK_MARKETPLACE = [
  {
    id: 'mock-lst-1',
    product_name: 'Thùng carton 40 × 30 × 30 cm',
    category_name: 'Bao bì và vật tư đóng gói',
    available_quantity: 10000,
    unit: 'thùng',
    unit_price: 4200,
    condition_text: 'Mới 100%',
    location_text: 'Dĩ An, Bình Dương',
    seller_name: 'ABC Packaging JSC',
    lot_number: 'SF-PK-01',
    manufacturing_date: '2026-06-01',
    expiry_date: '2027-06-01',
  },
  {
    id: 'mock-lst-2',
    product_name: 'Túi giấy kraft đáy đứng',
    category_name: 'Bao bì và vật tư đóng gói',
    available_quantity: 8000,
    unit: 'túi',
    unit_price: 2500,
    condition_text: 'Hàng mới 100%',
    location_text: 'Long Thành, Đồng Nai',
    seller_name: 'Phương Nam Box',
    lot_number: 'SF-PK-02',
    manufacturing_date: '2026-05-10',
    expiry_date: '2027-05-10',
  },
  {
    id: 'mock-lst-3',
    product_name: 'Vải cotton màu be cuộn',
    category_name: 'Vải và phụ liệu may mặc',
    available_quantity: 2000,
    unit: 'mét',
    unit_price: 65000,
    condition_text: 'Mới 98%',
    location_text: 'Tân Bình, TP.HCM',
    seller_name: 'XYZ Textile',
    lot_number: 'SF-TEX-09',
    manufacturing_date: '2026-04-15',
    expiry_date: '2028-04-15',
  },
]

const MOCK_WAREHOUSES = [
  {
    id: 'mock-wh-buyer-1',
    name: 'Kho Nhận Cầu Giấy',
    address: '456 Đường Nguyễn Phong Sắc',
    city: 'Hà Nội',
  },
]

const MOCK_MY_REQUESTS = [
  {
    id: 'mock-req-1',
    product_name: 'Thùng carton 40 × 30 × 30 cm',
    requested_quantity: 2000,
    proposed_unit_price: 4200,
    status: 'quoted', // submitted -> host_review -> quoted -> buyer_confirmed
    shipping_fee: 350000,
    loading_fee: 50000,
    count_fee: 30000,
    carrier: 'FastShip Co.',
    duration_text: '4 giờ',
    pickup_date: '2026-07-20',
  },
]

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'requests' | 'warehouses'>('overview')

  // Real + Mock state
  const [listings, setListings] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [myRequests, setMyRequests] = useState<any[]>([])

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')

  // Modals state
  const [selectedListing, setSelectedListing] = useState<any | null>(null)
  const [buyerCompany, setBuyerCompany] = useState('')
  const [requestQty, setRequestQty] = useState(0)
  const [proposedPrice, setProposedPrice] = useState(0)
  const [buyerContact, setBuyerContact] = useState('')
  const [buyerNote, setBuyerNote] = useState('')
  
  // Payment Receipt Upload Modal State
  const [paymentRequest, setPaymentRequest] = useState<any | null>(null)
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [isUploadingPayment, setIsUploadingPayment] = useState(false)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (['overview', 'marketplace', 'requests', 'warehouses'].includes(hash)) {
        setActiveTab(hash as any)
      }
    }
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    fetchData()
  }, [searchQuery, selectedCategory, selectedLocation])

  const fetchData = async () => {
    try {
      const realMarket = await getMarketplaceListings({
        search: searchQuery || undefined,
        categoryId: selectedCategory === 'all' ? undefined : parseInt(selectedCategory),
      })
      const realWarehouses = await getWarehouses()

      // filter mock listings
      const filteredMocks = MOCK_MARKETPLACE.filter(l => {
        const matchSearch = l.product_name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCat = selectedCategory === 'all' || l.category_name.includes(selectedCategory)
        const matchLoc = selectedLocation === 'all' || l.location_text.includes(selectedLocation)
        return matchSearch && matchCat && matchLoc
      })

      setListings(realMarket.length > 0 ? realMarket : filteredMocks)
      setWarehouses(realWarehouses.length > 0 ? realWarehouses : MOCK_WAREHOUSES)
      setMyRequests(MOCK_MY_REQUESTS)
    } catch {
      setListings(MOCK_MARKETPLACE)
      setWarehouses(MOCK_WAREHOUSES)
      setMyRequests(MOCK_MY_REQUESTS)
    }
  }

  // Handle purchase request submit
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!selectedListing) return

    const whId = warehouses[0]?.id || 'mock-wh-buyer-1'

    try {
      const res = await createPurchaseRequest({
        listingId: selectedListing.id,
        requestedQuantity: requestQty,
        proposedUnitPrice: proposedPrice,
        buyerWarehouseId: whId,
        buyerNote: `[Doanh nghiệp: ${buyerCompany}] [Liên hệ: ${buyerContact}] ${buyerNote}`,
      })

      if (res.success) {
        setSuccessMsg('Gửi yêu cầu đặt mua thành công!')
        setSelectedListing(null)
        fetchData()
      } else {
        // Mock fallback update
        const mockNewReq = {
          id: `mock-req-${Date.now()}`,
          product_name: selectedListing.product_name,
          requested_quantity: requestQty,
          proposed_unit_price: proposedPrice,
          status: 'submitted',
          shipping_fee: 0,
          loading_fee: 0,
          count_fee: 0,
          carrier: '',
        }
        setMyRequests([mockNewReq, ...myRequests])
        setSuccessMsg('Gửi yêu cầu đặt mua thành công (Mock Mode)!')
        setSelectedListing(null)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xảy ra.')
    }
  }

  // Handle logistics quote approval
  const handleApproveQuote = async (requestId: string) => {
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await approveLogisticsQuote(requestId)
      if (res.success) {
        setSuccessMsg('Đã chấp thuận báo giá vận chuyển!')
        fetchData()
      } else {
        setMyRequests(myRequests.map(r => r.id === requestId ? { ...r, status: 'buyer_confirmed' } : r))
        setSuccessMsg('Chấp thuận báo giá vận chuyển thành công (Mock Mode)!')
      }
    } catch {
      setMyRequests(myRequests.map(r => r.id === requestId ? { ...r, status: 'buyer_confirmed' } : r))
    }
  }

  // Handle payment receipt submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!paymentRequest || !paymentFile) {
      setErrorMsg('Vui lòng tải lên ảnh chụp biên lai chuyển khoản.')
      return
    }

    setIsUploadingPayment(true)
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      let filePath = `mock-receipts/${paymentRequest.id}_slip.jpg`
      if (user) {
        const fileName = `${paymentRequest.id}_receipt_${Date.now()}.${paymentFile.name.split('.').pop()}`
        const uploadRes = await uploadPaymentReceipt(user.id, fileName, paymentFile)
        if (!uploadRes.success) {
          throw new Error(uploadRes.error || 'Lỗi tải ảnh biên lai lên storage.')
        }
        filePath = uploadRes.data?.path || filePath
      }

      const totalAmount = (paymentRequest.requested_quantity * paymentRequest.proposed_unit_price) +
        (paymentRequest.shipping_fee || 0) + (paymentRequest.loading_fee || 0) + (paymentRequest.count_fee || 0)

      const res = await submitPaymentReceipt(paymentRequest.order_id || paymentRequest.id, totalAmount, filePath)
      if (res.success) {
        setSuccessMsg('Đã tải lên biên lai chuyển khoản thành công. Đang chờ Host xác nhận.')
        setPaymentRequest(null)
        setPaymentFile(null)
        fetchData()
      } else {
        setMyRequests(myRequests.map(r => r.id === paymentRequest.id ? { ...r, status: 'awaiting_payment' } : r))
        setSuccessMsg('Tải lên biên lai chuyển khoản thành công (Mock Mode)!')
        setPaymentRequest(null)
        setPaymentFile(null)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xảy ra trong quá trình thanh toán.')
    } finally {
      setIsUploadingPayment(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {successMsg && <div className="sf-msg-success mb-4">{successMsg}</div>}
      {errorMsg && <div className="sf-msg-error-banner mb-4">{errorMsg}</div>}

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="welcome-hero">
            <h1>Chào mừng trở lại, Buyer!</h1>
            <p>Khám phá thị trường B2B và quản lý đơn đặt hàng của doanh nghiệp.</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span>Đang yêu cầu mua</span>
              <h3>{myRequests.filter(r => r.status === 'submitted' || r.status === 'quoted').length}</h3>
            </div>
            <div className="metric-card">
              <span>Đơn hàng đã chốt</span>
              <h3>{myRequests.filter(r => r.status === 'buyer_confirmed' || r.status === 'converted_to_order').length}</h3>
            </div>
            <div className="metric-card">
              <span>Sản phẩm khả dụng trên sàn</span>
              <h3>{listings.length}</h3>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => { window.location.hash = '#marketplace' }} className="sf-btn sf-btn-primary">
              🛒 Khám phá Chợ sỉ B2B
            </button>
            <button onClick={() => { window.location.hash = '#requests' }} className="sf-btn sf-btn-secondary">
              📦 Theo dõi Đơn hàng của tôi
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Marketplace ── */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="section-header">
            <h2>Chợ sỉ B2B — Sản phẩm thanh lý trực tiếp từ nhà máy</h2>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--surface-sunken)] p-4 rounded-lg border border-[var(--border)]">
            <div className="form-group">
              <label className="sf-label">Danh mục sản phẩm</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="sf-select"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="Bao bì">Bao bì và vật tư đóng gói</option>
                <option value="Vải">Vải và phụ liệu may mặc</option>
                <option value="Thực phẩm">Nông sản khô và thực phẩm đóng gói</option>
              </select>
            </div>

            <div className="form-group">
              <label className="sf-label">Khu vực lưu kho</label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="sf-select"
              >
                <option value="all">Tất cả khu vực</option>
                <option value="TP.HCM">TP.HCM</option>
                <option value="Bình Dương">Bình Dương</option>
                <option value="Đồng Nai">Đồng Nai</option>
              </select>
            </div>

            <div className="form-group">
              <label className="sf-label">Từ khóa sản phẩm</label>
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="sf-input"
              />
            </div>
          </div>

          {/* Product Feed */}
          <div className="sf-grid-features">
            {listings.map((lst) => (
              <article key={lst.id} className="sf-card sf-card-interactive flex flex-col justify-between">
                <div>
                  <span className="sf-badge sf-badge-primary mb-3">{lst.category_name}</span>
                  <h3 className="text-base font-bold mb-2">{lst.product_name}</h3>
                  <div className="text-xs text-[var(--ink-secondary)] space-y-1 mb-4">
                    <p className="m-0">🏢 Nhà cung cấp: <strong>{lst.seller_name}</strong></p>
                    <p className="m-0">📍 Khu vực: {lst.location_text}</p>
                    <p className="m-0">📦 Tình trạng: {lst.condition_text}</p>
                    <p className="m-0">🔢 Số lô: <strong className="font-mono">{lst.lot_number || 'Chưa cung cấp'}</strong></p>
                    {lst.manufacturing_date && <p className="m-0">📅 NSX: {lst.manufacturing_date}</p>}
                    {lst.expiry_date && <p className="m-0">⏳ HSD: {lst.expiry_date}</p>}
                    <p className="m-0">📥 Số lượng khả dụng: <strong>{lst.available_quantity.toLocaleString()} {lst.unit}</strong></p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[var(--ink-muted)]">Giá bán</span>
                    <span className="text-lg font-extrabold text-[var(--primary)]">
                      {lst.unit_price ? `${lst.unit_price.toLocaleString()} VND / ${lst.unit}` : 'Thương lượng'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedListing(lst)
                      setBuyerCompany('')
                      setRequestQty(lst.available_quantity)
                      setProposedPrice(lst.unit_price || 0)
                      setBuyerContact('')
                      setBuyerNote('')
                    }}
                    className="sf-btn sf-btn-primary w-full"
                  >
                    Gửi yêu cầu mua
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Requests ── */}
      {activeTab === 'requests' && (
        <section className="sf-card">
          <div className="section-header">
            <h2>Yêu cầu & Đơn hàng của tôi</h2>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá đề xuất</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết Logistics</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((req) => {
                  const totalLogistics = (req.shipping_fee || 0) + (req.loading_fee || 0) + (req.count_fee || 0)
                  return (
                    <tr key={req.id}>
                      <td className="font-bold">{req.product_name}</td>
                      <td>{req.requested_quantity.toLocaleString()}</td>
                      <td>{req.proposed_unit_price.toLocaleString()} VND</td>
                      <td>
                        <span className={`badge ${
                          req.status === 'submitted' ? 'badge-warning' : 
                          req.status === 'quoted' ? 'badge-info' : 
                          req.status === 'buyer_confirmed' ? 'badge-warning' :
                          req.status === 'awaiting_payment' ? 'badge-info' :
                          'badge-success'
                        }`}>
                          {req.status === 'submitted' ? 'Chờ kiểm duyệt' : 
                           req.status === 'quoted' ? 'Đã báo giá cước' : 
                           req.status === 'buyer_confirmed' ? 'Chờ thanh toán' :
                           req.status === 'awaiting_payment' ? 'Chờ xác nhận thanh toán' :
                           'Hoàn thành'}
                        </span>
                      </td>
                      <td>
                        {totalLogistics > 0 ? (
                          <div className="text-xs space-y-1">
                            <p className="m-0 text-[var(--primary)] font-bold">Tổng cước: {totalLogistics.toLocaleString()} VND</p>
                            <p className="m-0 text-[var(--ink-muted)]">🚚 Phí vận chuyển: {req.shipping_fee?.toLocaleString()} VND</p>
                            <p className="m-0 text-[var(--ink-muted)]">📦 Bốc xếp: {req.loading_fee?.toLocaleString()} VND</p>
                            <p className="m-0 text-[var(--ink-muted)]">🔢 Kiểm đếm: {req.count_fee?.toLocaleString()} VND</p>
                            <p className="m-0 text-[var(--ink-muted)]">⏱️ Thời gian: {req.duration_text} (Hãng: {req.carrier})</p>
                            <p className="m-0 text-[var(--ink-muted)]">📅 Ngày lấy: {req.pickup_date}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--ink-muted)]">Đang chờ tính cước</span>
                        )}
                      </td>
                      <td>
                        {req.status === 'quoted' && (
                          <button
                            onClick={() => handleApproveQuote(req.id)}
                            className="sf-btn sf-btn-primary py-1.5 px-3 text-xs"
                          >
                            Xác nhận báo giá & Chốt đơn
                          </button>
                        )}
                        {req.status === 'buyer_confirmed' && (
                          <button
                            onClick={() => setPaymentRequest(req)}
                            className="sf-btn sf-btn-accent py-1.5 px-3 text-xs"
                          >
                            Thanh toán chuyển khoản
                          </button>
                        )}
                        {req.status === 'awaiting_payment' && (
                          <span className="text-xs text-[var(--ink-muted)]">Chờ duyệt thanh toán</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Tab: Warehouses ── */}
      {activeTab === 'warehouses' && (
        <section className="sf-card">
          <div className="section-header">
            <h2>Kho hàng tiếp nhận</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {warehouses.map((wh) => (
              <div key={wh.id} className="p-5 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
                <h3 className="text-base font-bold mb-2">{wh.name}</h3>
                <p className="text-sm text-[var(--ink-secondary)] mb-1">📍 Địa chỉ: {wh.address}, {wh.city}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Modal: Submit Purchase Request ── */}
      {selectedListing && (
        <div className="modal flex">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h3>Đăng ký mua: {selectedListing.product_name}</h3>
              <button onClick={() => setSelectedListing(null)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="form-group">
                <label className="sf-label">Doanh nghiệp mua (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Tên doanh nghiệp của bạn"
                  value={buyerCompany}
                  onChange={e => setBuyerCompany(e.target.value)}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Số lượng muốn mua (*)</label>
                <input
                  type="number"
                  required
                  max={selectedListing.available_quantity}
                  value={requestQty}
                  onChange={e => setRequestQty(parseInt(e.target.value))}
                  className="sf-input"
                />
                <span className="text-[11px] text-[var(--ink-muted)] mt-1">
                  Khả dụng tối đa: {selectedListing.available_quantity} {selectedListing.unit}
                </span>
              </div>

              <div className="form-group">
                <label className="sf-label">Giá mua đề xuất (VNĐ / đơn vị) (*)</label>
                <input
                  type="number"
                  required
                  value={proposedPrice}
                  onChange={e => setProposedPrice(parseInt(e.target.value))}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">SĐT / Email Liên hệ (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Số điện thoại hoặc Email người liên hệ"
                  value={buyerContact}
                  onChange={e => setBuyerContact(e.target.value)}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Ghi chú thêm</label>
                <textarea
                  placeholder="Ghi chú thêm cho người bán hoặc điều phối viên..."
                  value={buyerNote}
                  onChange={e => setBuyerNote(e.target.value)}
                  className="sf-input"
                  rows={3}
                />
              </div>

              <button type="submit" className="sf-btn sf-btn-primary w-full mt-4">
                Gửi yêu cầu mua
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ── Modal: Submit Payment Receipt ── */}
      {paymentRequest && (
        <div className="modal flex">
          <div className="modal-content animate-scale-in max-w-lg">
            <div className="modal-header">
              <h3>Thanh toán chuyển khoản: {paymentRequest.product_name}</h3>
              <button onClick={() => { setPaymentRequest(null); setPaymentFile(null); }} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="p-4 border border-[var(--primary-subtle)] bg-[var(--surface)] rounded-lg text-sm space-y-2">
                <p className="font-bold text-[var(--primary)] text-base mb-2">Thông tin tài khoản thụ hưởng</p>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[var(--ink-muted)]">Ngân hàng:</span>
                  <span className="col-span-2 font-bold">Vietcombank (CN TP.HCM)</span>

                  <span className="text-[var(--ink-muted)]">Số tài khoản:</span>
                  <span className="col-span-2 font-bold text-base text-[var(--primary)]">1023948576</span>

                  <span className="text-[var(--ink-muted)]">Tên thụ hưởng:</span>
                  <span className="col-span-2 font-bold">CTCP STOCKFLOW B2B</span>

                  <span className="text-[var(--ink-muted)]">Số tiền cần chuyển:</span>
                  <span className="col-span-2 font-bold text-base text-[var(--accent-dark)]">
                    {((paymentRequest.requested_quantity * paymentRequest.proposed_unit_price) +
                      (paymentRequest.shipping_fee || 0) + (paymentRequest.loading_fee || 0) + (paymentRequest.count_fee || 0)
                    ).toLocaleString()} VND
                  </span>

                  <span className="text-[var(--ink-muted)]">Nội dung chuyển:</span>
                  <span className="col-span-2 font-bold font-mono bg-[var(--surface-sunken)] px-2 py-0.5 rounded text-xs">
                    SF-PAY-{paymentRequest.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="sf-label">Tải lên biên lai chuyển khoản (Ảnh chụp giao dịch thành công) (*)</label>
                <input
                  type="file"
                  required
                  accept="image/png, image/jpeg, image/webp"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setPaymentFile(file)
                  }}
                  className="sf-input py-2"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadingPayment}
                className="sf-btn sf-btn-primary w-full mt-4"
              >
                {isUploadingPayment ? 'Đang tải lên...' : 'Xác nhận đã chuyển khoản'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
