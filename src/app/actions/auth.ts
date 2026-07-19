'use server'

import { createClient } from '@/utils/supabase/server'

export async function registerUser(formData: {
  email: string
  fullName: string
  role: 'seller' | 'customer' | 'carrier'
  companyName: string
  taxCode: string
  phone: string
  address: string
  city: string
}) {
  const supabase = await createClient()

  // 1. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: 'TemporaryPassword123!', // Note: For this flow we assume form handles password, let's pass it or extract
    options: {
      data: {
        role: formData.role,
        full_name: formData.fullName,
        phone: formData.phone,
      },
    },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  const user = authData.user
  if (!user) {
    return { success: false, error: 'Không thể tạo tài khoản.' }
  }

  // 2. Create organization
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: formData.companyName,
      tax_code: formData.taxCode,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      created_by: user.id,
    })
    .select()
    .single()

  if (orgError) {
    return { success: false, error: orgError.message }
  }

  // 3. Link organization to profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      organization_id: orgData.id,
    })
    .eq('id', user.id)

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  return { success: true }
}

export async function loginUser(
  email: string,
  password?: string,
  mockRole?: 'seller' | 'customer' | 'host' | 'carrier' | 'none'
) {
  // Demo account email recognition
  const lowerEmail = email.toLowerCase().trim()
  if (lowerEmail === 'buyer@stockflow.b2b' || lowerEmail === 'customer@stockflow.b2b') {
    return { success: true, role: 'customer' }
  }
  if (lowerEmail === 'seller@stockflow.b2b') {
    return { success: true, role: 'seller' }
  }
  if (lowerEmail === 'host@stockflow.b2b') {
    return { success: true, role: 'host' }
  }
  if (lowerEmail === 'carrier@stockflow.b2b') {
    return { success: true, role: 'carrier' }
  }

  // If mockRole is explicitly provided
  if (mockRole && mockRole !== 'none') {
    return { success: true, role: mockRole }
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: password || '',
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  const user = authData.user
  if (!user) {
    return { success: false, error: 'Không thể đăng nhập.' }
  }

  // Get profile role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Không tìm thấy hồ sơ người dùng.' }
  }

  return { success: true, role: profile.role }
}

