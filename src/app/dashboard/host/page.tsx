'use client'

import React, { useEffect, useState } from 'react'
import { reviewListing } from '@/app/actions/listing'
import { assignCoordinator } from '@/app/actions/marketplace'
import { submitLogisticsQuote, updateShipmentStatus, confirmPaymentReceipt } from '@/app/actions/logistics'
import {
  getSharedState,
  mockReviewListing,
  mockUpdatePurchaseRequest,
  mockAddLogisticsQuote,
  mockConfirmLogisticsQuote,
  mockUpdateOrderStatus,
  mockUpdateShipmentStatus,
} from '@/utils/mockStore'
import { getLanguage, t, Language } from '@/utils/i18n'
import { printB2BInvoice, exportToCSV } from '@/utils/exportDocs'

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'logistics' | 'orders' | 'shipments'>('overview')
  const [lang, setLang] = useState<Language>('vi')

  useEffect(() => {
    setLang(getLanguage())
    const handleLang = (e: any) => setLang(e.detail || getLanguage())
    window.addEventListener('stockflow-lang-changed', handleLang)
    return () => window.removeEventListener('stockflow-lang-changed', handleLang)
  }, [])

  // Real + Mock state
  const [pendingListings, setPendingListings] = useState<any[]>([])
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [shipments, setShipments] = useState<any[]>([])

  // Modal input states
  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState<any | null>(null)
  
  // Logistics quote inputs
  const [transportFee, setTransportFee] = useState(350000)
  const [loadingFee, setLoadingFee] = useState(50000)
  const [countFee, setCountFee] = useState(20000)
  const [durationText, setDurationText] = useState('4 giờ')

  const [selectedShipment, setSelectedShipment] = useState<any | null>(null)
  const [shipmentStatus, setShipmentStatus] = useState('in_transit')
  const [shipmentNotes, setShipmentNotes] = useState('')

  // Detailed view states
  const [detailedListing, setDetailedListing] = useState<any | null>(null)

  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (['overview', 'moderation', 'logistics', 'orders', 'shipments'].includes(hash)) {
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
      setPendingListings((shared.listings || []).filter((l: any) => l.status === 'pending_review'))
      setPurchaseRequests(shared.requests || [])
      setOrders(shared.orders || [])
      setShipments(shared.shipments || [])
    }
    handleStoreChange()
    window.addEventListener('stockflow-shared-state-updated', handleStoreChange)
    window.addEventListener('storage', handleStoreChange)
    return () => {
      window.removeEventListener('stockflow-shared-state-updated', handleStoreChange)
      window.removeEventListener('storage', handleStoreChange)
    }
  }, [])

  // Handle listing approval / rejection
  const handleReviewListing = async (listingId: string, approve: boolean) => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await reviewListing(listingId, approve, approve ? undefined : 'Sản phẩm không hợp lệ')
      if (res.success) {
        setSuccessMsg(approve ? 'Đã duyệt bài đăng lên Marketplace!' : 'Đã từ chối bài đăng.')
      } else {
        mockReviewListing(listingId, approve, approve ? undefined : 'Sản phẩm không hợp lệ')
        setSuccessMsg(approve ? 'Đã duyệt bài đăng lên Marketplace!' : 'Đã từ chối bài đăng.')
      }
    } catch {
      mockReviewListing(listingId, approve, approve ? undefined : 'Sản phẩm không hợp lệ')
      setSuccessMsg(approve ? 'Đã duyệt bài đăng lên Marketplace!' : 'Đã từ chối bài đăng.')
    }
    setDetailedListing(null)
  }

  // Handle coordinator assignment
  const handleAssignCoordinator = async (requestId: string) => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await assignCoordinator(requestId, 'host-user-123')
      if (res.success) {
        setSuccessMsg('Đã nhận quyền điều phối yêu cầu!')
      } else {
        mockUpdatePurchaseRequest(requestId, { status: 'assigned', coordinator_name: 'Admin Điều Phối' })
        setSuccessMsg('Gán quyền điều phối thành công!')
      }
    } catch {
      mockUpdatePurchaseRequest(requestId, { status: 'assigned', coordinator_name: 'Admin Điều Phối' })
      setSuccessMsg('Gán quyền điều phối thành công!')
    }
  }

  // Handle Logistics quote
  const handleLogisticsQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    if (!selectedRequestForQuote) return

    const totalQuote = transportFee + loadingFee + countFee

    try {
      const res = await submitLogisticsQuote(selectedRequestForQuote.id, totalQuote)
      if (res.success) {
        setSuccessMsg('Gửi báo giá cước vận chuyển thành công!')
        setSelectedRequestForQuote(null)
      } else {
        mockAddLogisticsQuote(selectedRequestForQuote.id, {
          shipping_fee: transportFee,
          loading_fee: loadingFee,
          count_fee: countFee,
          duration_text: durationText,
          carrier: 'Vận tải Minh Phát',
        })
        setSuccessMsg('Gửi báo giá cước vận chuyển thành công! Đã gửi tới Buyer để xác nhận.')
        setSelectedRequestForQuote(null)
      }
    } catch {
      mockAddLogisticsQuote(selectedRequestForQuote.id, {
        shipping_fee: transportFee,
        loading_fee: loadingFee,
        count_fee: countFee,
        duration_text: durationText,
        carrier: 'Vận tải Minh Phát',
      })
      setSuccessMsg('Gửi báo giá cước vận chuyển thành công! Đã gửi tới Buyer để xác nhận.')
      setSelectedRequestForQuote(null)
    }
  }

  // Convert to order
  const handleCreateOrder = (requestId: string) => {
    mockConfirmLogisticsQuote(requestId)
    setSuccessMsg('Đã chốt giao dịch và khởi tạo Đơn hàng chính thức!')
  }

  // Handle Shipment Update
  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    if (!selectedShipment) return

    try {
      const res = await updateShipmentStatus(selectedShipment.id, shipmentStatus, shipmentNotes)
      if (res.success) {
        setSuccessMsg('Cập nhật trạng thái vận đơn thành công!')
        setSelectedShipment(null)
      } else {
        mockUpdateShipmentStatus(selectedShipment.id, shipmentStatus as any, shipmentNotes)
        setSuccessMsg('Cập nhật trạng thái vận đơn thành công!')
        setSelectedShipment(null)
      }
    } catch {
      mockUpdateShipmentStatus(selectedShipment.id, shipmentStatus as any, shipmentNotes)
      setSuccessMsg('Cập nhật trạng thái vận đơn thành công!')
      setSelectedShipment(null)
    }
  }

  // Handle payment confirmation
  const handleConfirmPayment = async (orderId: string) => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await confirmPaymentReceipt(orderId)
      if (res.success) {
        setSuccessMsg('Đã xác nhận thanh toán thành công!')
      } else {
        mockUpdateOrderStatus(orderId, 'paid')
        setSuccessMsg('Xác nhận thanh toán thành công!')
      }
    } catch {
      mockUpdateOrderStatus(orderId, 'paid')
      setSuccessMsg('Xác nhận thanh toán thành công!')
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
            <h1>{t('title.welcome_host', lang)}</h1>
            <p>{t('sub.host_desc', lang)}</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span>{t('metric.host_pending_moderation', lang)}</span>
              <h3>{pendingListings.length}</h3>
            </div>
            <div className="metric-card">
              <span>{t('metric.host_pending_orders', lang)}</span>
              <h3>{purchaseRequests.filter(r => r.status === 'submitted' || r.status === 'seller_confirmed').length}</h3>
            </div>
            <div className="metric-card">
              <span>{t('metric.host_in_transit', lang)}</span>
              <h3>{shipments.filter(s => s.status === 'in_transit').length}</h3>
            </div>
          </div>

          {/* 📊 Visual Analytics Chart (Option 1) */}
          <div className="sf-card border border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>📊 {lang === 'ja' ? '総流通額と注文成長 (GMV & Order Growth Analytics)' : 'Phân tích Tổng lượng Giao dịch Sàn (GMV) & Tăng trưởng'}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToCSV('Host_Orders_Report', ['Mã Đơn', 'Khách hàng', 'Sản phẩm', 'Số lượng', 'Tổng cước'], purchaseRequests.map(r => [r.id, r.buyer_company, r.product_name, r.requested_quantity, (r.shipping_fee || 0) + (r.loading_fee || 0)]))}
                  className="sf-btn sf-btn-ghost text-xs border border-[var(--border)] py-1 px-2.5 font-bold"
                >
                  📥 {lang === 'ja' ? 'Excel エクスポート' : 'Xuất File Excel Báo cáo'}
                </button>
                <span className="text-xs text-[var(--ink-secondary)]">2026 (Q1 - Q3)</span>
              </div>
            </div>

            <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[var(--border)]">
              {[
                { month: 'T1', val: 60, text: '600M' },
                { month: 'T2', val: 80, text: '800M' },
                { month: 'T3', val: 75, text: '750M' },
                { month: 'T4', val: 95, text: '950M' },
                { month: 'T5', val: 110, text: '1.1B' },
                { month: 'T6', val: 130, text: '1.3B' },
                { month: 'T7', val: 150, text: '1.5B' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity">{bar.text}</span>
                  <div
                    className="w-full bg-indigo-600 rounded-t-md transition-all duration-500 hover:bg-indigo-700 shadow-sm"
                    style={{ height: `${bar.val * 0.65}%` }}
                  />
                  <span className="text-xs font-medium text-[var(--ink-secondary)]">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => { window.location.hash = '#moderation' }} className="sf-btn sf-btn-primary">
              {t('host_ui.goto_moderation', lang)}
            </button>
            <button onClick={() => { window.location.hash = '#logistics' }} className="sf-btn sf-btn-secondary">
              {t('host_ui.goto_logistics', lang)}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Moderation ── */}
      {activeTab === 'moderation' && (
        <section className="sf-card">
          <div className="section-header">
            <h2>{t('sec.moderation', lang)}</h2>
          </div>

          {pendingListings.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)] py-4">Không còn lô hàng nào chờ kiểm duyệt.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('th.product_name', lang)}</th>
                    <th>{t('th.seller', lang)}</th>
                    <th>{t('th.quantity', lang)}</th>
                    <th>{t('th.unit_price', lang)}</th>
                    <th>{t('th.lot_number', lang)}</th>
                    <th>{t('th.actions', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingListings.map((lst) => (
                    <tr key={lst.id}>
                      <td className="font-bold">{lst.product_name}</td>
                      <td>{lst.seller_name}</td>
                      <td>{lst.quantity} {lst.unit}</td>
                      <td>{lst.unit_price.toLocaleString()} VND</td>
                      <td className="font-mono text-xs">{lst.lot_number || '—'}</td>
                      <td>
                        <div className="flex items-center gap-3.5 flex-wrap">
                          <button onClick={() => setDetailedListing(lst)} className="sf-btn sf-btn-secondary py-1.5 px-3 text-xs">
                            {t('action.details', lang)}
                          </button>
                          <button onClick={() => handleReviewListing(lst.id, true)} className="sf-btn sf-btn-primary py-1.5 px-3 text-xs">
                            {t('action.agree', lang)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── Tab: Logistics Center ── */}
      {activeTab === 'logistics' && (
        <div className="space-y-6">
          <section className="sf-card">
            <div className="section-header">
              <h2>{t('sec.logistics', lang)}</h2>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('th.product_name', lang)}</th>
                    <th>{t('th.customer', lang)}</th>
                    <th>{t('th.quantity', lang)}</th>
                    <th>{t('role.host', lang)}</th>
                    <th>{t('th.status', lang)}</th>
                    <th>{t('th.actions', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="font-bold">{req.product_name}</td>
                      <td>{req.buyer_company}</td>
                      <td>{req.requested_quantity}</td>
                      <td>{req.coordinator_name}</td>
                      <td>
                        <span className={`badge ${
                          req.status === 'submitted' ? 'badge-warning' : 
                          req.status === 'seller_confirmed' ? 'badge-info' : 
                          'badge-success'
                        }`}>
                          {req.status === 'submitted' ? t('status.pending_review', lang) : 
                           req.status === 'seller_confirmed' ? t('status.seller_confirmed', lang) : t('status.quoted', lang)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3.5 flex-wrap">
                          {req.status === 'submitted' && (
                            <button onClick={() => handleAssignCoordinator(req.id)} className="sf-btn sf-btn-secondary py-1.5 px-3 text-xs">
                              {t('host_action.assign_me', lang)}
                            </button>
                          )}
                          {req.status === 'seller_confirmed' && (
                            <button
                              onClick={() => {
                                setSelectedRequestForQuote(req)
                              }}
                              className="sf-btn sf-btn-primary py-1.5 px-3 text-xs"
                            >
                              {t('host_action.input_quote', lang)}
                            </button>
                          )}
                          {req.status === 'quoted' && (
                            <button
                              onClick={() => handleCreateOrder(req.id)}
                              className="sf-btn sf-btn-secondary py-1.5 px-3 text-xs bg-emerald-50 text-emerald-600 border border-emerald-200"
                            >
                              {t('host_action.create_order', lang)}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ── Tab: Orders ── */}
      {activeTab === 'orders' && (
        <section className="sf-card">
          <div className="section-header">
            <h2>{t('sec.orders', lang)}</h2>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn mua</th>
                  <th>{t('th.customer', lang)}</th>
                  <th>{t('th.product_name', lang)}</th>
                  <th>Tổng giá trị</th>
                  <th>{t('th.status', lang)}</th>
                  <th>{t('th.actions', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="font-bold text-xs">{ord.id}</td>
                    <td>{ord.buyer_company}</td>
                    <td>{ord.product_name}</td>
                    <td className="font-bold text-[var(--primary)]">{ord.total_amount.toLocaleString()} VND</td>
                    <td>
                      <span className={`badge ${
                        ord.status === 'awaiting_payment' ? 'badge-warning' : 
                        ord.status === 'paid' ? 'badge-success' : 'badge-info'
                      }`}>
                        {ord.status === 'awaiting_payment' ? t('status.awaiting_payment', lang) : 
                         ord.status === 'paid' ? t('status.paid', lang) : ord.status}
                      </span>
                    </td>
                    <td>
                      {ord.status === 'awaiting_payment' && (
                        <div className="flex items-center gap-3 flex-wrap">
                          <a 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault()
                              alert("Mở xem ảnh biên lai minh họa: /receipts/mock_slip.jpg")
                            }}
                            className="text-xs text-[var(--primary)] underline"
                          >
                            {t('host_action.view_receipt', lang)}
                          </a>
                          <button
                            onClick={() => handleConfirmPayment(ord.id)}
                            className="sf-btn sf-btn-primary py-1 px-3 text-xs font-bold"
                          >
                            {t('host_action.confirm_payment', lang)}
                          </button>
                        </div>
                      )}
                      {ord.status === 'paid' && (
                        <span className="text-xs text-[var(--primary)] font-bold">✔️ {t('status.approved', lang)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Tab: Shipments ── */}
      {activeTab === 'shipments' && (
        <section className="sf-card">
          <div className="section-header">
            <h2>{t('sec.shipments', lang)}</h2>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vận đơn cho đơn hàng</th>
                  <th>{t('th.customer', lang)}</th>
                  <th>{t('role.carrier', lang)}</th>
                  <th>{t('th.status', lang)}</th>
                  <th>{t('th.actions', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shp) => (
                  <tr key={shp.id}>
                    <td className="font-bold">{shp.product_name}</td>
                    <td>{shp.buyer_company}</td>
                    <td>{shp.carrier}</td>
                    <td>
                      <span className={`badge ${
                        shp.status === 'scheduled' ? 'badge-warning' : 
                        shp.status === 'in_transit' ? 'badge-info' : 
                        'badge-success'
                      }`}>
                        {shp.status === 'scheduled' ? t('status.pending_review', lang) : 
                         shp.status === 'in_transit' ? t('status.in_transit', lang) : t('status.delivered', lang)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedShipment(shp)
                          setShipmentStatus(shp.status)
                          setShipmentNotes('')
                        }}
                        className="sf-btn sf-btn-secondary py-1.5 px-3 text-xs"
                      >
                        {t('host_action.update_shipment', lang)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Modal: Detailed Listing Verification ── */}
      {detailedListing && (
        <div className="modal flex">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h3>Duyệt sản phẩm: {detailedListing.product_name}</h3>
              <button onClick={() => setDetailedListing(null)} className="close-btn">&times;</button>
            </div>

            <div className="space-y-4 text-sm text-[var(--ink-secondary)]">
              <div>
                <h4 className="font-bold text-[var(--ink)]">Thông tin cơ bản</h4>
                <p className="m-0">🏢 <strong>Nhà cung cấp:</strong> {detailedListing.seller_name}</p>
                <p className="m-0">📦 <strong>Số lượng:</strong> {detailedListing.quantity} {detailedListing.unit}</p>
                <p className="m-0">💰 <strong>Đơn giá:</strong> {detailedListing.unit_price.toLocaleString()} VNĐ</p>
                <p className="m-0">📍 <strong>Vị trí kho:</strong> {detailedListing.location_text}</p>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <h4 className="font-bold text-[var(--ink)]">Thông số pháp lý / Nông sản</h4>
                <p className="m-0">🔢 <strong>Số lô sản xuất:</strong> <span className="font-mono">{detailedListing.lot_number || '—'}</span></p>
                {detailedListing.manufacturing_date && <p className="m-0">📅 <strong>Ngày sản xuất (MFG):</strong> {detailedListing.manufacturing_date}</p>}
                {detailedListing.expiry_date && <p className="m-0">⏳ <strong>Hạn sử dụng (EXP):</strong> {detailedListing.expiry_date}</p>}
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <h4 className="font-bold text-[var(--ink)]">Hồ sơ chứng từ đính kèm</h4>
                <p className="m-0">📄 <strong>Loại chứng từ:</strong> {detailedListing.docTypes || 'Chưa chọn'}</p>
                {detailedListing.document_notes && (
                  <p className="m-0 italic text-xs">📝 <strong>Ghi chú:</strong> {detailedListing.document_notes}</p>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => handleReviewListing(detailedListing.id, true)}
                  className="sf-btn sf-btn-primary flex-1"
                >
                  {t('action.agree', lang)}
                </button>
                <button
                  onClick={() => handleReviewListing(detailedListing.id, false)}
                  className="sf-btn sf-btn-ghost text-rose-600 flex-1"
                >
                  {t('action.reject', lang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Submit Logistics Quote ── */}
      {selectedRequestForQuote && (
        <div className="modal flex">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h3>{t('host_ui.quote_modal_title', lang)}</h3>
              <button onClick={() => setSelectedRequestForQuote(null)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleLogisticsQuoteSubmit} className="space-y-4">
              <div className="form-group">
                <label className="sf-label">{t('host_ui.quote_shipping_fee', lang)} (*)</label>
                <input
                  type="number"
                  required
                  value={transportFee}
                  onChange={e => setTransportFee(parseInt(e.target.value) || 0)}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">{t('host_ui.quote_loading_fee', lang)}</label>
                <input
                  type="number"
                  value={loadingFee}
                  onChange={e => setLoadingFee(parseInt(e.target.value) || 0)}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">{t('host_ui.quote_count_fee', lang)}</label>
                <input
                  type="number"
                  value={countFee}
                  onChange={e => setCountFee(parseInt(e.target.value) || 0)}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">{t('host_ui.quote_duration', lang)}</label>
                <input
                  type="text"
                  value={durationText}
                  onChange={e => setDurationText(e.target.value)}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">{t('host_ui.quote_carrier', lang)}</label>
                <select className="sf-select">
                  <option value="Vận tải Minh Phát">Vận tải Minh Phát</option>
                  <option value="FastShip Co.">FastShip Co.</option>
                  <option value="EcoDelivery">EcoDelivery Logistics</option>
                </select>
              </div>

              <div className="flex items-center gap-3.5 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForQuote(null)}
                  className="sf-btn sf-btn-ghost flex-1"
                >
                  {t('action.cancel', lang)}
                </button>
                <button type="submit" className="sf-btn sf-btn-primary flex-1">
                  {t('host_ui.quote_submit_btn', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Update Shipment Status ── */}
      {selectedShipment && (
        <div className="modal flex">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h3>Cập nhật vận trình</h3>
              <button onClick={() => setSelectedShipment(null)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleUpdateShipment} className="space-y-4">
              <div className="form-group">
                <label className="sf-label">Trạng thái mới</label>
                <select
                  value={shipmentStatus}
                  onChange={e => setShipmentStatus(e.target.value)}
                  className="sf-select"
                >
                  <option value="scheduled">Đã gom hàng tại kho</option>
                  <option value="in_transit">Đang vận chuyển liên tỉnh</option>
                  <option value="delivered">Đã giao hàng thành công</option>
                </select>
              </div>

              <div className="form-group">
                <label className="sf-label">Ghi chú hành trình</label>
                <textarea
                  placeholder="Ví dụ: Đang thông xe trạm thu phí Hà Nội..."
                  value={shipmentNotes}
                  onChange={e => setShipmentNotes(e.target.value)}
                  className="sf-input"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3.5 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="sf-btn sf-btn-ghost flex-1"
                >
                  Hủy
                </button>
                <button type="submit" className="sf-btn sf-btn-primary flex-1">
                  Cập nhật vận trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
