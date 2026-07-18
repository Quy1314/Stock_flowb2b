'use server'

import { createClient } from '@/utils/supabase/server'

export async function createWarehouse(formData: {
  name: string
  phone: string
  address: string
  city: string
}) {
  const supabase = await createClient()

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  // 2. Fetch profile organization_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.organization_id) {
    return { success: false, error: 'Tài khoản chưa liên kết với doanh nghiệp.' }
  }

  // 3. Insert warehouse
  const { data, error } = await supabase
    .from('warehouses')
    .insert({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      organization_id: profile.organization_id,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getWarehouses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) return []

  const { data } = await supabase
    .from('warehouses')
    .select('*')
    .eq('organization_id', profile.organization_id)

  return data || []
}
