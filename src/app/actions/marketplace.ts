'use server'

import { createClient } from '@/utils/supabase/server'

export async function getMarketplaceListings(filters?: {
  search?: string
  categoryId?: number
  locationText?: string
}) {
  const supabase = await createClient()

  let query = supabase.from('marketplace_listings').select('*')

  if (filters?.search) {
    query = query.ilike('product_name', `%${filters.search}%`)
  }
  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters?.locationText) {
    query = query.ilike('location_text', `%${filters.locationText}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching marketplace listings:', error.message)
    return []
  }

  return data || []
}

export async function createPurchaseRequest(formData: {
  listingId: string
  requestedQuantity: number
  proposedUnitPrice: number
  buyerWarehouseId: string
  buyerNote?: string
}) {
  const supabase = await createClient()

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  // 2. Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Không tìm thấy hồ sơ người dùng.' }
  }

  if (profile.role !== 'customer') {
    return { success: false, error: 'Chỉ tài khoản Người mua mới có quyền tạo yêu cầu đặt mua.' }
  }

  if (!profile.organization_id) {
    return { success: false, error: 'Tài khoản chưa liên kết với doanh nghiệp.' }
  }

  // 3. Fetch listing details to check available quantity
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('available_quantity, status')
    .eq('id', formData.listingId)
    .single()

  if (listingError || !listing) {
    return { success: false, error: 'Lô hàng không tồn tại.' }
  }

  if (listing.status !== 'approved') {
    return { success: false, error: 'Lô hàng chưa được duyệt bán.' }
  }

  if (formData.requestedQuantity > listing.available_quantity) {
    return { success: false, error: 'Số lượng yêu cầu vượt quá số lượng khả dụng của lô hàng.' }
  }

  // 4. Create purchase request
  const { data, error } = await supabase
    .from('purchase_requests')
    .insert({
      listing_id: formData.listingId,
      buyer_id: user.id,
      buyer_organization_id: profile.organization_id,
      buyer_warehouse_id: formData.buyerWarehouseId,
      requested_quantity: formData.requestedQuantity,
      proposed_unit_price: formData.proposedUnitPrice,
      buyer_note: formData.buyerNote || null,
      status: 'submitted',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function assignCoordinator(requestId: string, coordinatorId: string) {
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
    return { success: false, error: 'Chỉ tài khoản Điều phối viên mới có quyền gán người phụ trách.' }
  }

  // 3. Update purchase request
  const { data, error } = await supabase
    .from('purchase_requests')
    .update({
      coordinator_id: coordinatorId,
      status: 'in_negotiation',
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function respondPurchaseRequest(requestId: string, approve: boolean, reason?: string) {
  const supabase = await createClient()

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  // 2. Fetch profile to check if role === 'seller'
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Không tìm thấy hồ sơ người dùng.' }
  }

  if (profile.role !== 'seller') {
    return { success: false, error: 'Chỉ tài khoản Người bán mới có quyền phản hồi yêu cầu.' }
  }

  // 3. Call RPC function
  const { data, error } = await supabase.rpc('seller_respond_purchase_request', {
    p_request_id: requestId,
    p_approve: approve,
    p_reason: reason,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
