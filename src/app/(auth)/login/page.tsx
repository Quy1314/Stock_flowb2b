'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/app/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mockRole, setMockRole] = useState<'none' | 'seller' | 'customer' | 'host'>('none')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call action
      const res = await loginUser(email, password, mockRole === 'none' ? undefined : mockRole)

      if (res.success && res.role) {
        if (mockRole !== 'none') {
          document.cookie = `sb-mock-role=${res.role}; path=/`
        } else {
          // Clear mock role cookie
          document.cookie = 'sb-mock-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        }
        router.push(`/dashboard/${res.role}`)
      } else {
        setError(res.error || 'Đăng nhập không thành công.')
      }
    } catch (err: any) {
      setError(`Lỗi kết nối: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ background: 'var(--surface-sunken)' }}
    >
      {/* Decorative orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-40 -left-40 h-[400px] w-[400px] rounded-full opacity-10 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      <section className="sf-auth-card animate-scale-in relative z-10">
        <header className="mb-8 text-center">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-xl font-bold no-underline"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--ink)',
            }}
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold"
              style={{
                background: 'var(--primary)',
                color: 'var(--ink-on-primary)',
              }}
            >
              SF
            </span>
            StockFlow
          </Link>
          <h1
            className="mt-4"
            style={{
              fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
              color: 'var(--ink)',
            }}
          >
            Đăng nhập
          </h1>
          <p
            className="mx-auto mt-2"
            style={{
              fontSize: '0.9375rem',
              color: 'var(--ink-secondary)',
              margin: '0.5rem auto 0',
            }}
          >
            Chào mừng trở lại. Nhập thông tin để tiếp tục.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up delay-1">
          <div>
            <label htmlFor="email-input" className="sf-label">
              Email
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sf-input"
              placeholder="name@company.com"
              required={mockRole === 'none'}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password-input" className="sf-label">
              Mật khẩu
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sf-input"
              placeholder="••••••••"
              required={mockRole === 'none'}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sf-btn sf-btn-primary w-full"
            style={{
              padding: 'var(--space-4) var(--space-6)',
              fontSize: '1rem',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Đang xử lý…
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>

          {error && (
            <p className="sf-msg-error-banner" role="alert">
              {error}
            </p>
          )}

          {/* ── Dev-only mock role ─────────────────────────── */}
          <div className="sf-dev-only">
            <p className="sf-dev-only-label">🔧 Dành cho Lập trình viên</p>
            <label htmlFor="mock-role-select" className="sf-label" style={{ color: 'var(--ink-muted)' }}>
              Mô phỏng Vai trò
            </label>
            <select
              id="mock-role-select"
              value={mockRole}
              onChange={(e) => setMockRole(e.target.value as any)}
              className="sf-select"
            >
              <option value="none">Không mô phỏng (Dùng Auth thật)</option>
              <option value="customer">Người mua (Customer)</option>
              <option value="seller">Người bán (Seller)</option>
              <option value="host">Điều phối viên (Host)</option>
              <option value="carrier">Đơn vị vận tải (Carrier)</option>
            </select>
          </div>
        </form>

        <p
          className="mt-8 text-center text-sm animate-fade-up delay-2"
          style={{ color: 'var(--ink-secondary)' }}
        >
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            Đăng ký doanh nghiệp
          </Link>
        </p>
      </section>
    </main>
  )
}
