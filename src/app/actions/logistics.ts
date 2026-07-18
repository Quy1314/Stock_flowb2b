'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitLogisticsQuote(
  requestId: string,
  shippingFee: number,
  loadingFee?: number,
  countFee?: number,
  durationText?: string,
  logisticsPartnerId?: string,
  note?: string
) {
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

  // Use a fallback UUID for partner if not provided
  const partnerId = logisticsPartnerId || '00000000-0000-0000-0000-000000000000'

  // 3. Call RPC function
  const { data, error } = await supabase.rpc('host_add_logistics_quote', {
    p_request_id: requestId,
    p_logistics_partner_id: partnerId,
    p_shipping_fee: shippingFee,
    p_loading_fee: loadingFee || 0,
    p_count_fee: countFee || 0,
    p_duration_text: durationText || null,
    p_note: note || null,
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

  if (profileError || !profile || (profile.role !== 'host' && profile.role !== 'carrier')) {
    return { success: false, error: 'Chỉ tài khoản Điều phối viên hoặc Đơn vị vận tải mới có quyền cập nhật trạng thái vận đơn.' }
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

  return { success: true, data }
}

export async function submitPaymentReceipt(orderId: string, amount: number, receiptPath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Người dùng chưa đăng nhập.' }

  // Insert or update payment record
  const { data, error } = await supabase
    .from('payments')
    .upsert({
      order_id: orderId,
      payer_id: user.id,
      payment_type: 'bank_transfer',
      amount: amount,
      status: 'pending',
      beneficiary_name: 'StockFlow B2B',
      receipt_image_path: receiptPath,
    }, { onConflict: 'order_id,payment_type' })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Update order status if order exists
  await supabase
    .from('orders')
    .update({ status: 'awaiting_payment' }) // we keep the order status
    .eq('id', orderId)

  return { success: true, data }
}

export async function confirmPaymentReceipt(paymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Người dùng chưa đăng nhập.' }

  // check if host
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'host') return { success: false, error: 'Chỉ Host mới có quyền xác nhận thanh toán.' }

  // Update payment status to paid
  const { data: payment, error } = await supabase
    .from('payments')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Update order status to paid / awaiting_shipment
  await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', payment.order_id)

  return { success: true, data: payment }
}
