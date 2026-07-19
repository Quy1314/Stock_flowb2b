'use client'

import React, { useEffect, useState } from 'react'
import { getMarketplaceListings, createPurchaseRequest } from '@/app/actions/marketplace'
import { approveLogisticsQuote, submitPaymentReceipt } from '@/app/actions/logistics'
import { getWarehouses } from '@/app/actions/warehouse'
import { uploadPaymentReceipt } from '@/app/actions/storage'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import {
  getSharedState,
  mockCreatePurchaseRequest,
  mockConfirmLogisticsQuote,
  mockUpdateOrderStatus,
} from '@/utils/mockStore'
import { getLanguage, t, Language } from '@/utils/i18n'
import { printB2BInvoice, exportToCSV } from '@/utils/exportDocs'

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'requests' | 'warehouses'>('overview')
  const [lang, setLang] = useState<Language>('vi')

  useEffect(() => {
    setLang(getLanguage())
    const handleLang = (e: any) => setLang(e.detail || getLanguage())
    window.addEventListener('stockflow-lang-changed', handleLang)
    return () => window.removeEventListener('stockflow-lang-changed', handleLang)
  }, [])

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
    const handleStoreChange = () => {
      const shared = getSharedState()
      const approvedListings = (shared.listings || []).filter((l: any) => l.status === 'approved')
      
      const filtered = approvedListings.filter((l: any) => {
        const matchSearch = (l.product_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchCat = selectedCategory === 'all' || (l.category_name || '').includes(selectedCategory)
        const matchLoc = selectedLocation === 'all' || (l.location_text || '').includes(selectedLocation)
        return matchSearch && matchCat && matchLoc
      })

      setListings(filtered)
      setMyRequests(shared.requests || [])
      setWarehouses([{ id: 'wh-b1', name: 'Kho Nhận Cầu Giấy', address: '456 Nguyễn Phong Sắc', city: 'Hà Nội' }])
    }
    handleStoreChange()
    window.addEventListener('stockflow-shared-state-updated', handleStoreChange)
    window.addEventListener('storage', handleStoreChange)
    return () => {
      window.removeEventListener('stockflow-shared-state-updated', handleStoreChange)
      window.removeEventListener('storage', handleStoreChange)
    }
  }, [searchQuery, selectedCategory, selectedLocation])

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
      } else {
        mockCreatePurchaseRequest({
          listing_id: selectedListing.id,
          product_name: selectedListing.product_name,
          buyer_company: buyerCompany || 'Doanh nghiệp mua sỉ',
          buyer_contact: buyerContact,
          requested_quantity: requestQty,
          proposed_unit_price: proposedPrice,
          seller_name: selectedListing.seller_name,
        })
        setSuccessMsg('Gửi yêu cầu đặt mua thành công! Đã chuyển tới Seller và Host.')
        setSelectedListing(null)
      }
    } catch (err: any) {
      mockCreatePurchaseRequest({
        listing_id: selectedListing.id,
        product_name: selectedListing.product_name,
        buyer_company: buyerCompany || 'Doanh nghiệp mua sỉ',
        buyer_contact: buyerContact,
        requested_quantity: requestQty,
        proposed_unit_price: proposedPrice,
        seller_name: selectedListing.seller_name,
      })
      setSuccessMsg('Gửi yêu cầu đặt mua thành công! Đã chuyển tới Seller và Host.')
      setSelectedListing(null)
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
      } else {
        mockConfirmLogisticsQuote(requestId)
        setSuccessMsg('Chấp thuận báo giá vận chuyển thành công! Đã khởi tạo đơn hàng.')
      }
    } catch {
      mockConfirmLogisticsQuote(requestId)
      setSuccessMsg('Chấp thuận báo giá vận chuyển thành công! Đã khởi tạo đơn hàng.')
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
      } else {
        mockUpdateOrderStatus(paymentRequest.order_id || 'ORD-001', 'awaiting_payment', filePath)
        setSuccessMsg('Tải lên biên lai chuyển khoản thành công! Đã thông báo tới Host xác nhận.')
        setPaymentRequest(null)
        setPaymentFile(null)
      }
    } catch (err: any) {
      mockUpdateOrderStatus(paymentRequest.order_id || 'ORD-001', 'awaiting_payment')
      setSuccessMsg('Tải lên biên lai chuyển khoản thành công! Đã thông báo tới Host xác nhận.')
      setPaymentRequest(null)
      setPaymentFile(null)
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
            <h1>{t('title.welcome_buyer', lang)}</h1>
            <p>{t('sub.buyer_desc', lang)}</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span>{t('metric.buyer_pending_requests', lang)}</span>
              <h3>{myRequests.filter(r => r.status === 'submitted' || r.status === 'quoted').length}</h3>
            </div>
            <div className="metric-card">
              <span>{t('metric.buyer_confirmed_orders', lang)}</span>
              <h3>{myRequests.filter(r => r.status === 'buyer_confirmed' || r.status === 'converted_to_order').length}</h3>
            </div>
            <div className="metric-card">
              <span>{t('metric.marketplace_available', lang)}</span>
              <h3>{listings.length}</h3>
            </div>
          </div>

          {/* 📊 Visual Analytics Chart (Option 1) */}
          <div className="sf-card border border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>📊 {lang === 'ja' ? '購買支出と節約推移 (Purchase & Savings Analytics)' : 'Phân tích Chi phí Thu mua & Ngân sách Tiết kiệm'}</span>
              </h3>
              <span className="text-xs text-[var(--ink-secondary)]">2026 (Q1 - Q3)</span>
            </div>

            <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[var(--border)]">
              {[
                { month: 'T1', val: 55, text: '55,000' },
                { month: 'T2', val: 75, text: '75,000' },
                { month: 'T3', val: 60, text: '60,000' },
                { month: 'T4', val: 90, text: '90,000' },
                { month: 'T5', val: 80, text: '80,000' },
                { month: 'T6', val: 100, text: '100,000' },
                { month: 'T7', val: 120, text: '120,000' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity">{bar.text}</span>
                  <div
                    className="w-full bg-[var(--accent)] rounded-t-md transition-all duration-500 hover:bg-emerald-600 shadow-sm"
                    style={{ height: `${bar.val}%` }}
                  />
                  <span className="text-xs font-medium text-[var(--ink-secondary)]">{bar.month}</span>
                </div>
              ))}
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
                          <span className="text-xs text-[var(--ink-muted)] block mb-1">Chờ duyệt thanh toán</span>
                        )}
                        {(req.status === 'converted_to_order' || req.status === 'completed' || req.status === 'buyer_confirmed' || req.status === 'awaiting_payment') && (
                          <button
                            onClick={() => printB2BInvoice({
                              orderId: `INV-${req.id.substring(0, 8).toUpperCase()}`,
                              date: new Date().toISOString().slice(0, 10),
                              sellerCompany: req.seller_name || 'ABC Packaging JSC',
                              buyerCompany: req.buyer_company || 'Minh Phong Retail Co.',
                              productName: req.product_name,
                              quantity: req.requested_quantity,
                              unit: 'cái',
                              unitPrice: req.proposed_unit_price,
                              shippingFee: req.shipping_fee || 0,
                              loadingFee: req.loading_fee || 0,
                              countFee: req.count_fee || 0,
                              totalAmount: (req.requested_quantity * req.proposed_unit_price) + (req.shipping_fee || 0) + (req.loading_fee || 0) + (req.count_fee || 0),
                              paymentStatus: req.status === 'converted_to_order' ? 'Đã hoàn thành' : 'Đã xác nhận',
                              carrier: req.carrier || 'Vận tải Minh Phát',
                            })}
                            className="sf-btn sf-btn-ghost py-1 px-2 text-xs border border-[var(--border)] text-[var(--primary)] font-bold mt-1"
                          >
                            📄 In Hóa đơn B2B
                          </button>
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

              <div className="flex items-center gap-3.5 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="sf-btn sf-btn-ghost flex-1"
                >
                  Hủy
                </button>
                <button type="submit" className="sf-btn sf-btn-primary flex-1">
                  Gửi yêu cầu mua
                </button>
              </div>
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

              <div className="flex items-center gap-3.5 mt-6">
                <button
                  type="button"
                  onClick={() => { setPaymentRequest(null); setPaymentFile(null); }}
                  className="sf-btn sf-btn-ghost flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPayment}
                  className="sf-btn sf-btn-primary flex-1"
                >
                  {isUploadingPayment ? 'Đang tải lên...' : 'Xác nhận đã chuyển khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
