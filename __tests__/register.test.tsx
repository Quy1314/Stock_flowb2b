import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/(auth)/register/page'
import React from 'react'

// Mock the server action
vi.mock('@/app/actions/auth', () => ({
  registerUser: vi.fn().mockResolvedValue({ success: true }),
}))

describe('RegisterPage (Story 1.1)', () => {
  it('renders registration form with email, password, and role selector', () => {
    render(<RegisterPage />)
    
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Vai trò/i)).toBeInTheDocument()
  })

  it('toggles organization fields dynamically based on the selected role', async () => {
    render(<RegisterPage />)
    
    // Initially, organization fields should not be required or shown for some default or placeholder role
    // Let's select 'Seller' (Người bán)
    const roleSelect = screen.getByLabelText(/Vai trò/i)
    fireEvent.change(roleSelect, { target: { value: 'seller' } })
    
    // Now organization fields should be in the document
    expect(screen.getByLabelText(/Tên doanh nghiệp/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã số thuế/i)).toBeInTheDocument()
  })

  it('shows validation errors for invalid inputs', async () => {
    render(<RegisterPage />)
    
    const submitButton = screen.getByRole('button', { name: /Đăng ký/i })
    fireEvent.click(submitButton)
    
    // Should show error messages
    await waitFor(() => {
      expect(screen.getByText(/Email không hợp lệ/i)).toBeInTheDocument()
      expect(screen.getByText(/Mật khẩu phải từ 6 ký tự/i)).toBeInTheDocument()
    })
  })
})
