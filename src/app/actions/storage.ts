'use server'

import { createClient } from '@/utils/supabase/server'

export async function uploadProductImage(userId: string, fileName: string, fileBody?: any) {
  const supabase = await createClient()

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập.' }
  }

  // 2. Validate path security (user isolation)
  if (userId !== user.id) {
    return { success: false, error: 'Không có quyền tải lên thư mục của người khác.' }
  }

  // 3. Upload file
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`${userId}/${fileName}`, fileBody || new ArrayBuffer(0), {
      upsert: true,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
