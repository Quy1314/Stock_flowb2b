'use server'

import { createClient } from '@/utils/supabase/server'

export async function createListing(formData: {
  productName: string
  categoryId: number
  warehouseId: string
  quantity: number
  unit: string
  unitPrice: number
  conditionText: string
  manufacturingDate?: string
  expiryDate?: string
  locationText?: string
  description?: string
  isCommitted: boolean
  lotNumber?: string
  documentNotes?: string
}) {
  if (!formData.isCommitted) {
    return { success: false, error: 'Bạn phải cam kết thông tin đúng sự thật.' }
  }

  const supabase = await createClient()

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  // 2. Fetch profile organization_id and role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Không tìm thấy hồ sơ người dùng.' }
  }

  if (profile.role !== 'seller') {
    return { success: false, error: 'Chỉ tài khoản Người bán mới có thể đăng lô hàng.' }
  }

  if (!profile.organization_id) {
    return { success: false, error: 'Tài khoản chưa liên kết với doanh nghiệp.' }
  }

  // 3. Insert listing record
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      seller_organization_id: profile.organization_id,
      warehouse_id: formData.warehouseId,
      category_id: formData.categoryId,
      product_name: formData.productName,
      description: formData.description,
      quantity: formData.quantity,
      unit: formData.unit,
      unit_price: formData.unitPrice,
      condition_text: formData.conditionText,
      manufacturing_date: formData.manufacturingDate || null,
      expiry_date: formData.expiryDate || null,
      lot_number: formData.lotNumber || null,
      document_notes: formData.documentNotes || null,
      location_text: formData.locationText || 'Kho chỉ định',
      status: 'pending_review',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getListings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', user.id)

  return data || []
}

export async function reviewListing(listingId: string, approve: boolean, reason?: string) {
  const supabase = await createClient()

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  // 2. Fetch profile to check if role === 'host'
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Không tìm thấy hồ sơ người dùng.' }
  }

  if (profile.role !== 'host') {
    return { success: false, error: 'Chỉ tài khoản Điều phối viên mới có quyền duyệt tin.' }
  }

  // 3. Call RPC function
  const { data, error } = await supabase.rpc('host_review_listing', {
    p_listing_id: listingId,
    p_approve: approve,
    p_reason: reason,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

