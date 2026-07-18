import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'
import React from 'react'

// Mock useRouter from next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

beforeEach(() => {
  mockPush.mockClear()
})

// Mock the server action
vi.mock('@/app/actions/auth', () => ({
  loginUser: vi.fn().mockImplementation((email) => {
    if (email === 'seller@test.com') {
      return Promise.resolve({ success: true, role: 'seller' })
    }
    if (email === 'customer@test.com') {
      return Promise.resolve({ success: true, role: 'customer' })
    }
    if (email === 'host@test.com') {
      return Promise.resolve({ success: true, role: 'host' })
    }
    return Promise.resolve({ success: false, error: 'Thông tin đăng nhập sai.' })
  }),
}))

describe('LoginPage (Story 1.2)', () => {
  it('renders login form with email and password', () => {
    render(<LoginPage />)
    
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument()
  })

  it('renders developer mock role selector dropdown', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/Mô phỏng Vai trò/i)).toBeInTheDocument()
  })

  it('submits and redirects based on user role on successful auth login', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/Email/i)
    const passwordInput = screen.getByLabelText(/Mật khẩu/i)
    const submitButton = screen.getByRole('button', { name: /Đăng nhập/i })

    fireEvent.change(emailInput, { target: { value: 'seller@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/seller')
    })
  })

  it('submits using developer mock role select and redirects directly', async () => {
    render(<LoginPage />)
    
    const mockSelect = screen.getByLabelText(/Mô phỏng Vai trò/i)
    const emailInput = screen.getByLabelText(/Email/i)
    fireEvent.change(emailInput, { target: { value: 'host@test.com' } })
    fireEvent.change(mockSelect, { target: { value: 'host' } })
    
    const submitButton = screen.getByRole('button', { name: /Đăng nhập/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/host')
    })
  })
})
