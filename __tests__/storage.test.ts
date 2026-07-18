import { describe, it, expect, vi } from 'vitest'
import { uploadProductImage } from '@/app/actions/storage'

// Mock the Supabase server client
const mockUpload = vi.fn()

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'seller-123' } } }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockUpload,
      }),
    },
  })),
}))

describe('Storage Security Rules (Story 2.4)', () => {
  it('allows seller to upload to their own folder', async () => {
    mockUpload.mockResolvedValue({ data: { path: 'seller-123/file.jpg' }, error: null })

    const res = await uploadProductImage('seller-123', 'file.jpg')
    expect(res.success).toBe(true)
  })

  it('rejects upload to another seller folder', async () => {
    const res = await uploadProductImage('seller-abc', 'file.jpg')
    expect(res.success).toBe(false)
    expect(res.error).toContain('Không có quyền')
  })
})
