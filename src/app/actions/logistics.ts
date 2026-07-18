'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitLogisticsQuote(requestId: string, shippingFee: number) {
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
    return { success: false, error: 'Chỉ tài khoản Điều phối viên mới có quyền nhập báo giá logistics.' }
  }

  // 3. Call RPC function
  const { data, error } = await supabase.rpc('host_submit_logistics_quote', {
    p_request_id: requestId,
    p_shipping_fee: shippingFee,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function approveLogisticsQuote(requestId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Không tìm thấy hồ sơ người dùng.' }
  }

  if (profile.role !== 'customer') {
    return { success: false, error: 'Chỉ tài khoản Người mua mới có quyền chấp thuận báo giá.' }
  }

  const { data, error } = await supabase.rpc('customer_approve_logistics_quote', {
    p_request_id: requestId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateShipmentStatus(shipmentId: string, statusText: string, notes?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'host') {
    return { success: false, error: 'Chỉ tài khoản Điều phối viên mới có quyền cập nhật trạng thái vận đơn.' }
  }

  const { data, error } = await supabase.rpc('host_update_shipment_status', {
    p_shipment_id: shipmentId,
    p_status: statusText,
    p_notes: notes,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function confirmDelivery(shipmentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'host') {
    return { success: false, error: 'Chỉ tài khoản Điều phối viên mới có quyền xác nhận giao hàng.' }
  }

  const { data, error } = await supabase.rpc('host_confirm_delivery', {
    p_shipment_id: shipmentId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
