'use client'

import React, { useEffect, useState } from 'react'
import { createListing, getListings } from '@/app/actions/listing'
import { createWarehouse, getWarehouses } from '@/app/actions/warehouse'
import { respondPurchaseRequest } from '@/app/actions/marketplace'
import { getSharedState, mockAddListing, mockUpdatePurchaseRequest } from '@/utils/mockStore'

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'requests' | 'warehouses'>('overview')

  // Real + Mock state
  const [listings, setListings] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])

  // UI state
  const [showListingModal, setShowListingModal] = useState(false)
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)
  
  // Multi-image state (max 5)
  const [productImages, setProductImages] = useState<{ name: string; dataUrl: string }[]>([])
  
  // Document state (max 8)
  const [documents, setDocuments] = useState<{ name: string; type: 'pdf' | 'image'; dataUrl: string }[]>([])
  const [docNotes, setDocNotes] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([])

  // Dynamic Hints / Warnings
  const [categoryHint, setCategoryHint] = useState('')
  const [foodWarning, setFoodWarning] = useState('')

  // Form states
  const [newListing, setNewListing] = useState({
    productName: '',
    categoryId: 1,
    warehouseId: '',
    quantity: 0,
    unit: 'cái',
    unitPrice: 0,
    conditionText: 'Mới 100%',
    manufacturingDate: '',
    expiryDate: '',
    lotNumber: '',
    description: '',
    isCommitted: false,
  })

  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Hà Nội',
  })

  // Created Listing Preview
  const [createdPreview, setCreatedPreview] = useState<any | null>(null)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    // Sync active tab with location hash
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (['overview', 'listings', 'requests', 'warehouses'].includes(hash)) {
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
      setListings(shared.listings || [])
      setRequests(shared.requests || [])
    }
    handleStoreChange()
    window.addEventListener('stockflow-shared-state-updated', handleStoreChange)
    window.addEventListener('storage', handleStoreChange)
    return () => {
      window.removeEventListener('stockflow-shared-state-updated', handleStoreChange)
      window.removeEventListener('storage', handleStoreChange)
    }
  }, [])

  const fetchData = async () => {
    try {
      const realListings = await getListings()
      const realWarehouses = await getWarehouses()
      const shared = getSharedState()

      setListings(realListings.length > 0 ? realListings : shared.listings)
      setWarehouses(realWarehouses.length > 0 ? realWarehouses : [{ id: 'wh-1', name: 'Kho Hà Nội 1', phone: '0987654321', address: '123 Đường Láng', city: 'Hà Nội' }])
      setRequests(shared.requests)
    } catch {
      const shared = getSharedState()
      setListings(shared.listings)
      setRequests(shared.requests)
    }
  }

  // Update hints dynamically when categoryId changes
  useEffect(() => {
    const cid = Number(newListing.categoryId)
    setCategoryHint('')
    setFoodWarning('')
    if (cid === 1) {
      setCategoryHint('Gợi ý chứng từ:\n- Hóa đơn hoặc chứng từ nguồn gốc\n- Thông số kỹ thuật\n- Tài liệu về vật liệu nếu có')
    } else if (cid === 2) {
      setCategoryHint('Gợi ý chứng từ:\n- Hóa đơn hoặc chứng từ nguồn gốc\n- Thông số chất liệu\n- Giấy chứng nhận chất lượng nếu có')
    } else if (cid === 3) {
      setFoodWarning('Yêu cầu đối với nhóm thực phẩm:\n- Bắt buộc nhập ngày sản xuất\n- Bắt buộc nhập hạn sử dụng\n- Bắt buộc nhập số lô\n- Cần hóa đơn hoặc chứng từ nguồn gốc\n- Cần giấy kiểm dịch hoặc giấy chuyên ngành...\n- Listing sẽ không được duyệt nếu thiếu hồ sơ cần thiết')
    }
  }, [newListing.categoryId])

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (productImages.length >= 5) {
        setErrorMsg('Bạn chỉ được tải tối đa 5 ảnh sản phẩm.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`Ảnh ${file.name} vượt quá 5MB.`)
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setProductImages(prev => [...prev, { name: file.name, dataUrl: ev.target!.result as string }])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // Handle document upload
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (documents.length >= 8) {
        setErrorMsg('Bạn chỉ được tải tối đa 8 chứng từ.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} vượt quá 10MB.`)
        return
      }
      const isPdf = file.type === 'application/pdf'
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setDocuments(prev => [...prev, { name: file.name, type: isPdf ? 'pdf' : 'image', dataUrl: ev.target!.result as string }])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // Handle document checkbox change
  const handleDocTypeToggle = (val: string) => {
    if (selectedDocTypes.includes(val)) {
      setSelectedDocTypes(selectedDocTypes.filter(t => t !== val))
    } else {
      setSelectedDocTypes([...selectedDocTypes, val])
    }
  }

  // Handle Listing Submission
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!newListing.isCommitted) {
      setErrorMsg('Bạn phải cam kết thông tin đúng sự thật.')
      return
    }

    // Food category extra validations
    if (Number(newListing.categoryId) === 3) {
      if (!newListing.manufacturingDate || !newListing.expiryDate || !newListing.lotNumber) {
        setErrorMsg('Danh mục Nông sản & Thực phẩm yêu cầu bắt buộc có Ngày sản xuất, Hạn sử dụng và Số lô.')
        return
      }
    }

    const selectedWh = warehouses[0]?.id || 'mock-wh-1'
    
    try {
      const res = await createListing({
        productName: newListing.productName,
        categoryId: newListing.categoryId,
        warehouseId: selectedWh,
        quantity: newListing.quantity,
        unit: newListing.unit,
        unitPrice: newListing.unitPrice,
        conditionText: newListing.conditionText,
        manufacturingDate: newListing.manufacturingDate || undefined,
        expiryDate: newListing.expiryDate || undefined,
        description: newListing.description || undefined,
        isCommitted: newListing.isCommitted,
        lotNumber: newListing.lotNumber || undefined,
        documentNotes: docNotes || undefined,
      })

      // Setup preview object
      const previewObj = {
        product_name: newListing.productName,
        category_name: newListing.categoryId === 1 ? 'Bao bì và vật tư đóng gói' : newListing.categoryId === 2 ? 'Vải và phụ liệu may mặc' : 'Nông sản & Thực phẩm đóng gói',
        quantity: newListing.quantity,
        unit: newListing.unit,
        unit_price: newListing.unitPrice,
        location_text: warehouses.find(w => w.id === selectedWh)?.name || 'Kho chỉ định',
        condition_text: newListing.conditionText,
        manufacturing_date: newListing.manufacturingDate,
        expiry_date: newListing.expiryDate,
        lot_number: newListing.lotNumber,
        imgCount: productImages.length,
        docCount: documents.length,
        docTypes: selectedDocTypes.join(', '),
        document_notes: docNotes,
      }

      if (res.success) {
        setSuccessMsg('Đăng sản phẩm thành công!')
        setCreatedPreview(previewObj)
        setShowListingModal(false)
        fetchData()
      } else {
        // Mock store insertion for instant demo mode
        mockAddListing({
          product_name: newListing.productName,
          category_name: previewObj.category_name,
          category_id: newListing.categoryId,
          quantity: newListing.quantity,
          unit: newListing.unit,
          unit_price: newListing.unitPrice,
          condition_text: newListing.conditionText,
          location_text: previewObj.location_text,
          lot_number: newListing.lotNumber,
          manufacturing_date: newListing.manufacturingDate,
          expiry_date: newListing.expiryDate,
          document_notes: docNotes,
          docTypes: selectedDocTypes.join(', '),
        })
        setSuccessMsg('Đăng sản phẩm thành công! Listing đã được gửi tới Host để duyệt.')
        setCreatedPreview(previewObj)
        setShowListingModal(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xảy ra.')
    }
  }

  // Handle Warehouse Submission
  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await createWarehouse(newWarehouse)
      if (res.success) {
        setSuccessMsg('Thêm kho thành công!')
        setShowWarehouseModal(false)
        fetchData()
      } else {
        const mockNewWh = {
          id: `mock-wh-${Date.now()}`,
          name: newWarehouse.name,
          phone: newWarehouse.phone,
          address: newWarehouse.address,
          city: newWarehouse.city,
        }
        setWarehouses([...warehouses, mockNewWh])
        setSuccessMsg('Thêm kho thành công!')
        setShowWarehouseModal(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xảy ra.')
    }
  }

  const handleRespondRequest = async (requestId: string, approve: boolean) => {
    try {
      const res = await respondPurchaseRequest(requestId, approve)
      if (res.success) {
        setSuccessMsg(approve ? 'Đã chấp thuận yêu cầu mua' : 'Đã từ chối yêu cầu mua')
      } else {
        mockUpdatePurchaseRequest(requestId, { status: approve ? 'seller_confirmed' : 'seller_rejected' })
        setSuccessMsg(`Đã cập nhật yêu cầu mua (${approve ? 'Chấp thuận' : 'Từ chối'})!`)
      }
    } catch {
      mockUpdatePurchaseRequest(requestId, { status: approve ? 'seller_confirmed' : 'seller_rejected' })
      setSuccessMsg(`Đã cập nhật yêu cầu mua (${approve ? 'Chấp thuận' : 'Từ chối'})!`)
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
            <h1>Chào mừng trở lại, Seller!</h1>
            <p>Quản lý kho hàng dư thừa và tối ưu hóa doanh thu của bạn.</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span>Tổng lượng hàng đăng ký</span>
              <h3>{listings.reduce((acc, curr) => acc + (curr.quantity || 0), 0).toLocaleString()}</h3>
            </div>
            <div className="metric-card">
              <span>Lô hàng đang hiển thị</span>
              <h3>{listings.filter(l => l.status === 'approved').length}</h3>
            </div>
            <div className="metric-card">
              <span>Lô hàng chờ duyệt</span>
              <h3>{listings.filter(l => l.status === 'pending_review').length}</h3>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setProductImages([])
                setDocuments([])
                setDocNotes('')
                setSelectedDocTypes([])
                setCreatedPreview(null)
                setShowListingModal(true)
              }}
              className="sf-btn sf-btn-primary"
            >
              ➕ Đăng lô hàng thanh lý mới
            </button>
            <button onClick={() => setShowWarehouseModal(true)} className="sf-btn sf-btn-secondary">
              🏢 Thiết lập thêm kho hàng
            </button>
          </div>

          {/* Listing Preview Container after successful submission */}
          {createdPreview && (
            <div className="sf-card border-2 border-[var(--primary)] relative">
              <h2 className="text-lg font-bold text-[var(--primary)] mb-4 flex items-center gap-2">
                <span>✅ Lô hàng của bạn đã được đăng ký thành công!</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-extrabold mb-3">{createdPreview.product_name}</h3>
                  <div className="text-sm space-y-1 text-[var(--ink-secondary)]">
                    <p className="m-0"><strong>Danh mục:</strong> {createdPreview.category_name}</p>
                    <p className="m-0"><strong>Số lượng:</strong> {createdPreview.quantity} {createdPreview.unit}</p>
                    <p className="m-0"><strong>Giá bán:</strong> {createdPreview.unit_price ? `${createdPreview.unit_price.toLocaleString()} VND` : 'Thỏa thuận'}</p>
                    <p className="m-0"><strong>Khu vực:</strong> {createdPreview.location_text}</p>
                    <p className="m-0"><strong>Tình trạng:</strong> {createdPreview.condition_text}</p>
                    {createdPreview.lot_number && <p className="m-0"><strong>Số lô:</strong> {createdPreview.lot_number}</p>}
                    {createdPreview.manufacturing_date && <p className="m-0"><strong>Ngày sản xuất:</strong> {createdPreview.manufacturing_date}</p>}
                    {createdPreview.expiry_date && <p className="m-0"><strong>Hạn sử dụng:</strong> {createdPreview.expiry_date}</p>}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[var(--surface-sunken)] text-sm space-y-2 border border-[var(--border)]">
                  <h4 className="font-bold text-xs uppercase text-[var(--ink-muted)]">Hồ sơ kiểm duyệt đính kèm</h4>
                  <p className="m-0">🖼️ <strong>Số lượng ảnh thực tế:</strong> {createdPreview.imgCount} / 5</p>
                  <p className="m-0">📄 <strong>Số lượng chứng từ:</strong> {createdPreview.docCount} / 8</p>
                  <p className="m-0">🏷️ <strong>Loại chứng từ:</strong> {createdPreview.docTypes || 'Chưa chọn'}</p>
                  {createdPreview.document_notes && (
                    <p className="m-0 text-xs italic text-[var(--ink-secondary)]">
                      📝 Ghi chú: {createdPreview.document_notes}
                    </p>
                  )}
                  <div className="mt-3">
                    <span className="sf-badge sf-badge-primary">Chờ Admin StockFlow kiểm duyệt hồ sơ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Listings ── */}
      {activeTab === 'listings' && (
        <section className="sf-card">
          <div className="section-header">
            <h2>Sản phẩm của tôi</h2>
            <button
              onClick={() => {
                setProductImages([])
                setDocuments([])
                setDocNotes('')
                setSelectedDocTypes([])
                setCreatedPreview(null)
                setShowListingModal(true)
              }}
              className="sf-btn sf-btn-primary"
            >
              ➕ Thêm mới
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Số lô</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((lst) => (
                  <tr key={lst.id}>
                    <td className="font-bold">{lst.product_name}</td>
                    <td>{lst.category_name || 'Vật tư'}</td>
                    <td>{lst.available_quantity} / {lst.quantity} {lst.unit}</td>
                    <td>{lst.unit_price ? `${lst.unit_price.toLocaleString()} VND` : 'Thương lượng'}</td>
                    <td className="font-mono text-xs">{lst.lot_number || '—'}</td>
                    <td>
                      <span className={`badge ${lst.status === 'approved' ? 'badge-success' : lst.status === 'pending_review' ? 'badge-warning' : 'badge-danger'}`}>
                        {lst.status === 'approved' ? 'Đã duyệt' : lst.status === 'pending_review' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Tab: Requests ── */}
      {activeTab === 'requests' && (
        <section className="sf-card">
          <div className="section-header">
            <h2>Đơn mua từ khách hàng</h2>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Khách hàng</th>
                  <th>Số lượng</th>
                  <th>Đơn giá đề xuất</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="font-bold">{req.product_name}</td>
                    <td>{req.buyer_company}</td>
                    <td>{req.requested_quantity}</td>
                    <td>{req.proposed_unit_price.toLocaleString()} VND</td>
                    <td className="text-xs text-[var(--ink-secondary)]">{req.buyer_note || '—'}</td>
                    <td>
                      <span className={`badge ${
                        req.status === 'submitted' ? 'badge-info' : 
                        req.status === 'seller_confirmed' ? 'badge-success' : 
                        'badge-danger'
                      }`}>
                        {req.status === 'submitted' ? 'Chờ phản hồi' : req.status === 'seller_confirmed' ? 'Đã đồng ý' : 'Đã từ chối'}
                      </span>
                    </td>
                    <td>
                      {req.status === 'submitted' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleRespondRequest(req.id, true)} className="sf-btn sf-btn-primary py-1.5 px-3 text-xs">
                            Đồng ý
                          </button>
                          <button onClick={() => handleRespondRequest(req.id, false)} className="sf-btn sf-btn-ghost text-rose-500 py-1.5 px-3 text-xs">
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Tab: Warehouses ── */}
      {activeTab === 'warehouses' && (
        <section className="sf-card">
          <div className="section-header">
            <h2>Danh sách kho hàng doanh nghiệp</h2>
            <button onClick={() => setShowWarehouseModal(true)} className="sf-btn sf-btn-primary">
              ➕ Thiết lập kho mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {warehouses.map((wh) => (
              <div key={wh.id} className="p-5 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
                <h3 className="text-base font-bold mb-2">{wh.name}</h3>
                <p className="text-sm text-[var(--ink-secondary)] mb-1">📍 Địa chỉ: {wh.address}, {wh.city}</p>
                <p className="text-sm text-[var(--ink-secondary)]">📞 Điện thoại: {wh.phone}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Modal: Create Listing ── */}
      {showListingModal && (
        <div className="modal flex">
          <div className="modal-content !max-w-xl">
            <div className="modal-header">
              <h3>Đăng lô hàng thanh lý mới</h3>
              <button onClick={() => setShowListingModal(false)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleCreateListing} className="space-y-4">
              
              {/* Image upload gallery (Max 5) */}
              <div className="form-group">
                <label className="sf-label">Ảnh thực tế lô hàng (Tối đa 5 ảnh)</label>
                <p className="text-xs text-[var(--ink-muted)] mb-2">Vui lòng tải ảnh thực tế sản phẩm, tem nhãn, bao bì và tình trạng thực tế của lô hàng.</p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sf-input py-1.5"
                />
                <div className="gallery-box mt-3 p-3 border-2 border-dashed border-[var(--border)] rounded-lg bg-[var(--surface-sunken)]">
                  {productImages.length === 0 ? (
                    <div className="text-center text-xs text-[var(--ink-muted)] py-4">Chưa có ảnh sản phẩm</div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {productImages.map((img, idx) => (
                        <div key={idx} className="relative w-full aspect-square border border-[var(--border)] rounded overflow-hidden">
                          <img src={img.dataUrl} alt="Product" className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 text-center bg-[var(--primary)] text-[var(--ink-on-primary)] text-[9px] font-bold py-0.5">Đại diện</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs border-none cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="sf-label">Tên sản phẩm (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lô túi nilon xuất khẩu dư"
                    value={newListing.productName}
                    onChange={e => setNewListing({ ...newListing, productName: e.target.value })}
                    className="sf-input"
                  />
                </div>

                <div className="form-group">
                  <label className="sf-label">Danh mục (*)</label>
                  <select
                    value={newListing.categoryId}
                    onChange={e => setNewListing({ ...newListing, categoryId: parseInt(e.target.value) })}
                    className="sf-select"
                  >
                    <option value={1}>Bao bì và vật tư đóng gói</option>
                    <option value={2}>Vải và phụ liệu may mặc</option>
                    <option value={3}>Nông sản khô và thực phẩm đóng gói</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Hints based on Category */}
              {categoryHint && (
                <div className="p-3 bg-[var(--primary-subtle)] text-[var(--primary-dark)] text-xs rounded border border-[var(--primary)] whitespace-pre-line">
                  💡 {categoryHint}
                </div>
              )}
              {foodWarning && (
                <div className="p-3 bg-[var(--accent-light)] text-[var(--accent-dark)] text-xs font-bold rounded border border-[var(--accent)] whitespace-pre-line">
                  ⚠️ {foodWarning}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label className="sf-label">Kho hàng xuất phát (*)</label>
                  <select className="sf-select">
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name} ({wh.city})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="sf-label">Tình trạng hàng</label>
                  <input
                    type="text"
                    placeholder="Mới 100%, dư sản xuất, lưu kho 3 tháng"
                    value={newListing.conditionText}
                    onChange={e => setNewListing({ ...newListing, conditionText: e.target.value })}
                    className="sf-input"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="sf-label">Số lượng muốn bán (*)</label>
                  <input
                    type="number"
                    required
                    value={newListing.quantity}
                    onChange={e => setNewListing({ ...newListing, quantity: parseInt(e.target.value) })}
                    className="sf-input"
                  />
                </div>

                <div className="form-group">
                  <label className="sf-label">Đơn vị tính (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="cái, kg, chiếc, cuộn..."
                    value={newListing.unit}
                    onChange={e => setNewListing({ ...newListing, unit: e.target.value })}
                    className="sf-input"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="sf-label">Giá bán đề xuất (VNĐ)</label>
                  <input
                    type="number"
                    value={newListing.unitPrice || ''}
                    onChange={e => setNewListing({ ...newListing, unitPrice: parseInt(e.target.value) || 0 })}
                    placeholder="Để trống nếu muốn thỏa thuận"
                    className="sf-input"
                  />
                </div>

                <div className="form-group">
                  <label className="sf-label">Số lô {Number(newListing.categoryId) === 3 && '(*)'}</label>
                  <input
                    type="text"
                    required={Number(newListing.categoryId) === 3}
                    placeholder="Số lô xuất xưởng để truy xuất"
                    value={newListing.lotNumber}
                    onChange={e => setNewListing({ ...newListing, lotNumber: e.target.value })}
                    className="sf-input"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="sf-label">Ngày sản xuất {Number(newListing.categoryId) === 3 && '(*)'}</label>
                  <input
                    type="date"
                    required={Number(newListing.categoryId) === 3}
                    value={newListing.manufacturingDate}
                    onChange={e => setNewListing({ ...newListing, manufacturingDate: e.target.value })}
                    className="sf-input"
                  />
                </div>

                <div className="form-group">
                  <label className="sf-label">Hạn sử dụng {Number(newListing.categoryId) === 3 && '(*)'}</label>
                  <input
                    type="date"
                    required={Number(newListing.categoryId) === 3}
                    value={newListing.expiryDate}
                    onChange={e => setNewListing({ ...newListing, expiryDate: e.target.value })}
                    className="sf-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="sf-label">Mô tả ngắn</label>
                <textarea
                  value={newListing.description}
                  onChange={e => setNewListing({ ...newListing, description: e.target.value })}
                  placeholder="Mô tả chi tiết về lô hàng..."
                  className="sf-input"
                  rows={2}
                />
              </div>

              {/* Document verification block */}
              <div className="form-group border-t border-[var(--border)] pt-4">
                <h4 className="font-bold text-sm text-[var(--ink)] mb-2">Giấy chứng nhận và chứng từ liên quan</h4>
                <label className="sf-label">Loại chứng từ đính kèm (chọn nhiều)</label>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-[var(--ink-secondary)]">
                  {[
                    'Hóa đơn hoặc chứng từ nguồn gốc',
                    'Giấy chứng nhận chất lượng',
                    'Giấy kiểm dịch',
                    'Hồ sơ truy xuất nguồn gốc',
                    'Giấy chứng nhận an toàn thực phẩm',
                    'Thông số kỹ thuật',
                    'Chứng từ khác',
                  ].map((docType) => (
                    <label key={docType} className="flex items-center gap-2 cursor-pointer font-normal">
                      <input
                        type="checkbox"
                        checked={selectedDocTypes.includes(docType)}
                        onChange={() => handleDocTypeToggle(docType)}
                        className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      {docType}
                    </label>
                  ))}
                </div>

                <label className="sf-label">Tải lên chứng từ (Tối đa 8 files, PDF/Ảnh)</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleDocChange}
                  className="sf-input py-1.5"
                />

                {/* Docs list preview */}
                {documents.length > 0 && (
                  <div className="doc-list mt-3 space-y-2">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border border-[var(--border)] rounded bg-[var(--surface-sunken)] text-xs">
                        <div className="flex items-center gap-2">
                          {doc.type === 'pdf' ? (
                            <span className="w-8 h-8 flex items-center justify-center bg-rose-100 text-rose-600 font-bold rounded">PDF</span>
                          ) : (
                            <img src={doc.dataUrl} alt="Thumbnail" className="w-8 h-8 object-cover rounded border border-[var(--border)]" />
                          )}
                          <span className="font-bold text-[var(--ink-secondary)] truncate max-w-xs">{doc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                          className="px-2 py-1 text-xs bg-rose-50 text-rose-600 border-none rounded cursor-pointer hover:bg-rose-100"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group mt-3">
                  <label className="sf-label">Ghi chú bộ chứng từ</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giấy chứng nhận ATTP số hiệu..."
                    value={docNotes}
                    onChange={e => setDocNotes(e.target.value)}
                    className="sf-input"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--border)]">
                <input
                  id="commit-check"
                  type="checkbox"
                  checked={newListing.isCommitted}
                  onChange={e => setNewListing({ ...newListing, isCommitted: e.target.checked })}
                  className="mt-1"
                />
                <label htmlFor="commit-check" className="text-xs text-[var(--ink-secondary)] cursor-pointer">
                  Tôi cam kết các thông tin đăng bán trên là chính xác và hoàn toàn chịu trách nhiệm trước pháp luật.
                </label>
              </div>

              <button type="submit" className="sf-btn sf-btn-primary w-full mt-4">
                Đăng tin thanh lý
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Create Warehouse ── */}
      {showWarehouseModal && (
        <div className="modal flex">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h3>Thiết lập kho hàng doanh nghiệp</h3>
              <button onClick={() => setShowWarehouseModal(false)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleCreateWarehouse} className="space-y-4">
              <div className="form-group">
                <label className="sf-label">Tên kho</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kho Tổng Đông Anh"
                  value={newWarehouse.name}
                  onChange={e => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  required
                  placeholder="Số hotline kho"
                  value={newWarehouse.phone}
                  onChange={e => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Địa chỉ</label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, ngõ, đường..."
                  value={newWarehouse.address}
                  onChange={e => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                  className="sf-input"
                />
              </div>

              <div className="form-group">
                <label className="sf-label">Thành phố</label>
                <select
                  value={newWarehouse.city}
                  onChange={e => setNewWarehouse({ ...newWarehouse, city: e.target.value })}
                  className="sf-select"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </div>

              <button type="submit" className="sf-btn sf-btn-primary w-full mt-4">
                Khởi tạo kho hàng
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
