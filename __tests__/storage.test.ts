import { describe, it, expect, vi } from 'vitest'
import {
  uploadProductImage,
  uploadListingDocument,
  uploadShipmentProof,
  uploadPaymentReceipt,
} from '@/app/actions/storage'

// Mock the Supabase server client
const mockUpload = vi.fn()

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockUpload,
      }),
    },
  })),
}))

describe('Storage Security Rules (Story 2.4)', () => {
  it('allows user to upload to their own product images folder', async () => {
    mockUpload.mockResolvedValue({ data: { path: 'user-123/file.jpg' }, error: null })
    const res = await uploadProductImage('user-123', 'file.jpg')
    expect(res.success).toBe(true)
  })

  it('rejects product image upload to another user folder', async () => {
    const res = await uploadProductImage('user-abc', 'file.jpg')
    expect(res.success).toBe(false)
    expect(res.error).toContain('Không có quyền')
  })

  it('allows user to upload to their own listing documents folder', async () => {
    mockUpload.mockResolvedValue({ data: { path: 'user-123/doc.pdf' }, error: null })
    const res = await uploadListingDocument('user-123', 'doc.pdf')
    expect(res.success).toBe(true)
  })

  it('allows user to upload to their own shipment proofs folder', async () => {
    mockUpload.mockResolvedValue({ data: { path: 'user-123/pod.jpg' }, error: null })
    const res = await uploadShipmentProof('user-123', 'pod.jpg')
    expect(res.success).toBe(true)
  })

  it('allows user to upload to their own payment receipts folder', async () => {
    mockUpload.mockResolvedValue({ data: { path: 'user-123/receipt.jpg' }, error: null })
    const res = await uploadPaymentReceipt('user-123', 'receipt.jpg')
    expect(res.success).toBe(true)
  })
})
