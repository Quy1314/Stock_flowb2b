'use client'

import React, { useEffect, useState } from 'react'
import { getSharedState, saveSharedState } from '@/utils/mockStore'

export default function CarrierDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'capacity'>('overview')

  // Capacity states
  const [capacity, setCapacity] = useState({
    readyTrucks: 6,
    truckType: 'Xe tải 3,5 tấn',
    maxLoad: '5 tấn',
    activeRegion: 'TP.HCM – Bình Dương – Đồng Nai',
    availableDate: '2026-07-20',
    notes: 'Luôn túc trực tại cụm khu công nghiệp',
  })

  // Trips lists
  const [trips, setTrips] = useState<any[]>([])
  const [filterPickup, setFilterPickup] = useState('')
  const [filterDropoff, setFilterDropoff] = useState('')
  const [filterTruck, setFilterTruck] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Modals state
  const [showCapacityModal, setShowCapacityModal] = useState(false)
  const [selectedTripDetails, setSelectedTripDetails] = useState<any | null>(null)
  const [selectedTripForQuote, setSelectedTripForQuote] = useState<any | null>(null)

  // Bidding quote form
  const [quoteForm, setQuoteForm] = useState({
    transportFee: 0,
    loadingFee: 0,
    countFee: 0,
    durationText: '4 giờ',
    pickupDate: '2026-07-20',
    notes: '',
    isCommitted: false,
  })

  // Ongoing trip state
  const [myTripStatus, setMyTripStatus] = useState('Đã lấy hàng')
  const [proofImages, setProofImages] = useState<string[]>([])

  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (['overview', 'trips', 'capacity'].includes(hash)) {
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
      setTrips(shared.trips || [])
    }
    handleStoreChange()
    window.addEventListener('stockflow-shared-state-updated', handleStoreChange)
    window.addEventListener('storage', handleStoreChange)
    return () => {
      window.removeEventListener('stockflow-shared-state-updated', handleStoreChange)
      window.removeEventListener('storage', handleStoreChange)
    }
  }, [])

  // Filter logic
  const getFilteredTrips = () => {
    return trips.filter(t => {
      const matchPick = !filterPickup || t.pickRegion === filterPickup
      const matchDrop = !filterDropoff || t.dropRegion === filterDropoff
      const matchTruck = !filterTruck || t.truck === filterTruck
      const matchStatus = !filterStatus || t.status === filterStatus
      return matchPick && matchDrop && matchTruck && matchStatus
    })
  }

  // Handle capacity update
  const handleCapacitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('Năng lực vận chuyển đã được cập nhật thành công!')
    setShowCapacityModal(false)
  }

  // Handle quote submit
  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quoteForm.isCommitted) {
      setErrorMsg('Vui lòng tích xác nhận phương tiện và năng lực.')
      return
    }

    const totalQuote = quoteForm.transportFee + quoteForm.loadingFee + quoteForm.countFee
    setSuccessMsg(`Báo giá cho chuyến ${selectedTripForQuote.id} đã được gửi! Tổng cộng: ${totalQuote.toLocaleString()} VNĐ.`)
    
    // Update trip status in shared mock store
    const shared = getSharedState()
    const tripIdx = (shared.trips || []).findIndex((t: any) => t.id === selectedTripForQuote.id)
    if (tripIdx !== -1) {
      shared.trips[tripIdx].status = 'Đã báo giá'
      saveSharedState(shared)
    } else {
      setTrips(trips.map(t => t.id === selectedTripForQuote.id ? { ...t, status: 'Đã báo giá' } : t))
    }
    setSelectedTripForQuote(null)
  }

  // Handle proof upload
  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setProofImages(prev => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {successMsg && <div className="sf-msg-success mb-4">{successMsg}</div>}
      {errorMsg && <div className="sf-msg-error-banner mb-4">{errorMsg}</div>}

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Company profile summary */}
          <div className="sf-card border-l-4 border-[var(--primary)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Công ty TNHH Vận tải Minh Phát</h2>
              <p className="text-sm text-[var(--ink-secondary)] mb-2">TP.HCM – Bình Dương – Đồng Nai · Đội xe chuyên nghiệp</p>
              <span className="sf-badge sf-badge-primary">Đối tác vận chuyển đã xác minh</span>
            </div>
            <button onClick={() => setShowCapacityModal(true)} className="sf-btn sf-btn-primary">
              ⚙️ Cập nhật Năng lực vận hành
            </button>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span>Đội xe sẵn sàng</span>
              <h3>{capacity.readyTrucks} xe</h3>
            </div>
            <div className="metric-card">
              <span>Chuyến hàng khả dụng</span>
              <h3>{trips.filter(t => t.status === 'Đang nhận báo giá').length} chuyến</h3>
            </div>
            <div className="metric-card">
              <span>Đánh giá hoàn thành</span>
              <h3>98.5%</h3>
            </div>
          </div>

          {/* Ongoing trip control panel */}
          <section className="sf-card bg-[var(--surface-sunken)]">
            <h2 className="text-base font-extrabold mb-3">Chuyến hàng đang đảm nhận: SF-005</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm text-[var(--ink-secondary)]">
                <p className="m-0">📦 <strong>Mặt hàng:</strong> Vải thun dệt kim sỉ</p>
                <p className="m-0">📍 <strong>Tuyến:</strong> KCN Sóng Thần, Bình Dương → KCN Tân Bình, TP.HCM</p>
                <p className="m-0">🚛 <strong>Loại xe điều động:</strong> Xe tải 3.5 tấn</p>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="sf-label">Cập nhật hành trình vận đơn</label>
                  <div className="flex gap-2">
                    <select
                      value={myTripStatus}
                      onChange={e => setMyTripStatus(e.target.value)}
                      className="sf-select flex-1"
                    >
                      <option value="Đã xác nhận chuyến">Đã xác nhận chuyến</option>
                      <option value="Đang đến điểm lấy">Đang đến điểm lấy</option>
                      <option value="Đã lấy hàng">Đã lấy hàng</option>
                      <option value="Đang vận chuyển">Đang vận chuyển</option>
                      <option value="Đã đến điểm giao">Đã đến điểm giao</option>
                      <option value="Đã giao hàng thành công">Đã giao hàng thành công</option>
                    </select>
                    <button onClick={() => setSuccessMsg(`Đã cập nhật trạng thái vận đơn: ${myTripStatus}`)} className="sf-btn sf-btn-primary">
                      Cập nhật
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="sf-label">Tải ảnh/bằng chứng giao nhận (Proof of Delivery)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleProofChange}
                    className="sf-input py-1.5"
                  />
                  {proofImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {proofImages.map((src, idx) => (
                        <div key={idx} className="w-full aspect-square rounded border border-[var(--border)] overflow-hidden">
                          <img src={src} alt="Proof" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Tab: Trips ── */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          <div className="section-header">
            <h2>Chuyến hàng đang tìm đối tác vận chuyển</h2>
          </div>

          {/* Filter */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-[var(--surface-sunken)] p-4 rounded-lg border border-[var(--border)] text-sm">
            <div className="form-group">
              <select value={filterPickup} onChange={e => setFilterPickup(e.target.value)} className="sf-select">
                <option value="">Tất cả điểm lấy</option>
                <option value="Bình Dương">Bình Dương</option>
                <option value="TP.HCM">TP.HCM</option>
                <option value="Đồng Nai">Đồng Nai</option>
              </select>
            </div>

            <div className="form-group">
              <select value={filterDropoff} onChange={e => setFilterDropoff(e.target.value)} className="sf-select">
                <option value="">Tất cả điểm giao</option>
                <option value="Bình Dương">Bình Dương</option>
                <option value="TP.HCM">TP.HCM</option>
                <option value="Đồng Nai">Đồng Nai</option>
              </select>
            </div>

            <div className="form-group">
              <select value={filterTruck} onChange={e => setFilterTruck(e.target.value)} className="sf-select">
                <option value="">Tất cả loại xe</option>
                <option value="Xe tải 1,5 tấn">Xe tải 1,5 Tấn</option>
                <option value="Xe tải 5 tấn">Xe tải 5 Tấn</option>
              </select>
            </div>

            <div className="form-group">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="sf-select">
                <option value="">Tất cả trạng thái</option>
                <option value="Đang nhận báo giá">Đang nhận báo giá</option>
                <option value="Đã có đối tác nhận">Đã có đối tác nhận</option>
                <option value="Đã báo giá">Đã báo giá</option>
              </select>
            </div>

            <button onClick={() => setSuccessMsg('Đã cập nhật bộ lọc chuyến hàng!')} className="sf-btn sf-btn-primary w-full">
              Lọc chuyến hàng
            </button>
          </div>

          {/* Grid list of trips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getFilteredTrips().map((t) => (
              <article key={t.id} className="sf-card flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs font-bold text-[var(--ink-muted)]">{t.id}</span>
                    <span className={`badge ${t.status === 'Đang nhận báo giá' ? 'badge-warning' : 'badge-success'}`}>
                      {t.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-2">{t.goods}</h3>
                  <div className="text-xs text-[var(--ink-secondary)] space-y-1 mb-4">
                    <p className="m-0">📍 <strong>Lấy:</strong> {t.pickup}</p>
                    <p className="m-0">🚩 <strong>Giao:</strong> {t.drop}</p>
                    <p className="m-0">⚖️ <strong>Khối lượng:</strong> {t.weight} / Thể tích: {t.volume}</p>
                    <p className="m-0">🚛 <strong>Xe yêu cầu:</strong> {t.truck}</p>
                    <p className="m-0">📅 <strong>Ngày cần lấy:</strong> {t.date}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                  <button onClick={() => setSelectedTripDetails(t)} className="sf-btn sf-btn-secondary flex-1 text-xs">
                    Chi tiết
                  </button>
                  <button
                    disabled={t.status !== 'Đang nhận báo giá'}
                    onClick={() => {
                      setSelectedTripForQuote(t)
                      setQuoteForm({
                        transportFee: 350000,
                        loadingFee: 50000,
                        countFee: 20000,
                        durationText: '4 giờ',
                        pickupDate: t.date,
                        notes: '',
                        isCommitted: false,
                      })
                    }}
                    className="sf-btn sf-btn-primary flex-1 text-xs"
                  >
                    Báo giá cước
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal: Update Capacity ── */}
      {showCapacityModal && (
        <div className="modal flex">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cập nhật Năng lực vận chuyển</h3>
              <button onClick={() => setShowCapacityModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleCapacitySubmit} className="space-y-4">
              <div className="form-group">
                <label className="sf-label">Số xe đang sẵn sàng hoạt động</label>
                <input
                  type="number"
                  value={capacity.readyTrucks}
                  onChange={e => setCapacity({ ...capacity, readyTrucks: parseInt(e.target.value) })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Loại xe chủ lực</label>
                <select
                  value={capacity.truckType}
                  onChange={e => setCapacity({ ...capacity, truckType: e.target.value })}
                  className="sf-select"
                >
                  <option value="Xe tải 1,5 tấn">Xe tải 1,5 tấn</option>
                  <option value="Xe tải 3,5 tấn">Xe tải 3,5 tấn</option>
                  <option value="Xe tải 5 tấn">Xe tải 5 tấn</option>
                </select>
              </div>

              <div className="form-group">
                <label className="sf-label">Tải trọng tối đa</label>
                <input
                  type="text"
                  value={capacity.maxLoad}
                  onChange={e => setCapacity({ ...capacity, maxLoad: e.target.value })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Tuyến đường hoạt động</label>
                <input
                  type="text"
                  value={capacity.activeRegion}
                  onChange={e => setCapacity({ ...capacity, activeRegion: e.target.value })}
                  className="sf-input"
                />
              </div>

              <button type="submit" className="sf-btn sf-btn-primary w-full mt-4">
                Lưu năng lực vận chuyển
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Trip details ── */}
      {selectedTripDetails && (
        <div className="modal flex">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h3>Chi tiết chuyến: {selectedTripDetails.id}</h3>
              <button onClick={() => setSelectedTripDetails(null)} className="close-btn">&times;</button>
            </div>

            <div className="space-y-3 text-sm text-[var(--ink-secondary)]">
              <p>📦 <strong>Mặt hàng:</strong> {selectedTripDetails.goods}</p>
              <p>⚖️ <strong>Khối lượng:</strong> {selectedTripDetails.weight}</p>
              <p>📐 <strong>Thể tích:</strong> {selectedTripDetails.volume}</p>
              <p>📍 <strong>Điểm lấy:</strong> {selectedTripDetails.pickup}</p>
              <p>🚩 <strong>Điểm giao:</strong> {selectedTripDetails.drop}</p>
              <p>🛣️ <strong>Cự ly dự kiến:</strong> {selectedTripDetails.distance}</p>
              <p>📅 <strong>Hạn bốc xếp lấy:</strong> {selectedTripDetails.date}</p>
              <p>💪 <strong>Yêu cầu bốc xếp:</strong> {selectedTripDetails.loading}</p>
              <p>🔢 <strong>Yêu cầu kiểm đếm hàng:</strong> {selectedTripDetails.count}</p>
              <p className="border-t border-[var(--border)] pt-3 text-xs italic">Ghi chú: Lô hàng dễ vỡ, cần che chắn mui bạt kín khi trời mưa bão.</p>
            </div>
            
            <button
              onClick={() => {
                const t = selectedTripDetails
                setSelectedTripDetails(null)
                setSelectedTripForQuote(t)
              }}
              className="sf-btn sf-btn-primary w-full mt-4"
            >
              Gửi báo giá ngay
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Submit Quote ── */}
      {selectedTripForQuote && (
        <div className="modal flex">
          <div className="modal-content !max-w-md animate-scale-in">
            <div className="modal-header">
              <h3>Báo giá vận chuyển: {selectedTripForQuote.id}</h3>
              <button onClick={() => setSelectedTripForQuote(null)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="form-group">
                <label className="sf-label">Cước vận chuyển chính (VNĐ) (*)</label>
                <input
                  type="number"
                  required
                  value={quoteForm.transportFee}
                  onChange={e => setQuoteForm({ ...quoteForm, transportFee: parseInt(e.target.value) || 0 })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Phí bốc xếp đề xuất (VNĐ)</label>
                <input
                  type="number"
                  value={quoteForm.loadingFee}
                  onChange={e => setQuoteForm({ ...quoteForm, loadingFee: parseInt(e.target.value) || 0 })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Phí kiểm đếm đề xuất (VNĐ)</label>
                <input
                  type="number"
                  value={quoteForm.countFee}
                  onChange={e => setQuoteForm({ ...quoteForm, countFee: parseInt(e.target.value) || 0 })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Thời gian giao nhận dự kiến</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 4 giờ, 1 ngày"
                  value={quoteForm.durationText}
                  onChange={e => setQuoteForm({ ...quoteForm, durationText: e.target.value })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Ngày lấy hàng khả thi</label>
                <input
                  type="date"
                  value={quoteForm.pickupDate}
                  onChange={e => setQuoteForm({ ...quoteForm, pickupDate: e.target.value })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Ghi chú kèm báo giá</label>
                <textarea
                  placeholder="Ghi chú về phương tiện hoặc thời gian..."
                  value={quoteForm.notes}
                  onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  className="sf-input"
                  rows={2}
                />
              </div>

              <div className="flex items-start gap-2.5 pt-2">
                <input
                  id="commit-quote-check"
                  type="checkbox"
                  checked={quoteForm.isCommitted}
                  onChange={e => setQuoteForm({ ...quoteForm, isCommitted: e.target.checked })}
                  className="mt-1"
                />
                <label htmlFor="commit-quote-check" className="text-xs text-[var(--ink-secondary)] cursor-pointer">
                  Tôi cam kết có đủ phương tiện, lái xe hợp lệ và năng lực vận hành hành trình này.
                </label>
              </div>

              <button type="submit" className="sf-btn sf-btn-primary w-full mt-4">
                Gửi báo giá cước
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
