'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/app/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mockRole, setMockRole] = useState<'none' | 'seller' | 'customer' | 'host' | 'carrier'>('none')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await loginUser(email, password, mockRole === 'none' ? undefined : mockRole)

      if (res.success && res.role) {
        if (mockRole !== 'none') {
          document.cookie = `sb-mock-role=${res.role}; path=/`
        } else {
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
      className="relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 0% 0%, oklch(0.92 0.05 180), oklch(0.97 0.01 180) 60%)',
      }}
    >
      {/* Abstract Warehouse & Cargo Background Silhouettes */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <svg
          className="absolute bottom-0 left-0 w-full h-[320px] text-[var(--primary)] opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,224L60,208C120,192,240,160,360,165.3C480,171,600,213,720,218.7C840,224,960,192,1080,176C1200,160,1320,160,1380,160L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
        {/* Soft blur orbs */}
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[var(--primary)] opacity-20 blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-[var(--accent)] opacity-10 blur-[80px]" />
      </div>

      {/* Auth Card with Glassmorphism */}
      <section
        className="relative z-10 w-full max-w-[28rem] rounded-2xl p-8 md:p-10 shadow-2xl transition-all duration-300 animate-scale-in"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 128, 128, 0.15)',
          boxShadow: '0 20px 40px oklch(0.18 0.02 180 / 0.08)',
        }}
      >
        <header className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-2xl font-bold no-underline transition-transform duration-200 hover:scale-105"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--ink)',
            }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold shadow-md animate-pulse"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: 'var(--ink-on-primary)',
              }}
            >
              SF
            </span>
            StockFlow B2B
          </Link>
          <h1
            className="mt-4 font-bold"
            style={{
              fontSize: '1.625rem',
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
            }}
          >
            Đăng nhập
          </h1>
          <p
            className="mx-auto mt-2 text-sm"
            style={{
              color: 'var(--ink-secondary)',
            }}
          >
            Chào mừng trở lại. Nhập thông tin để tiếp tục.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up">
          {/* Quick Demo Account Role Selection */}
          <div className="mb-4 p-3 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)]">
            <p className="text-[11px] font-bold text-[var(--ink-muted)] mb-2 uppercase tracking-wide">⚡ Chọn tài khoản Demo nhanh</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail('buyer@stockflow.b2b')
                  setPassword('Password123!')
                  setMockRole('customer')
                }}
                className={`p-2 rounded-lg border text-left font-medium transition-all ${
                  mockRole === 'customer'
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--border)] hover:border-[var(--primary)]'
                }`}
              >
                🛒 Người mua (Buyer)
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('seller@stockflow.b2b')
                  setPassword('Password123!')
                  setMockRole('seller')
                }}
                className={`p-2 rounded-lg border text-left font-medium transition-all ${
                  mockRole === 'seller'
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--border)] hover:border-[var(--primary)]'
                }`}
              >
                📦 Người bán (Seller)
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('carrier@stockflow.b2b')
                  setPassword('Password123!')
                  setMockRole('carrier')
                }}
                className={`p-2 rounded-lg border text-left font-medium transition-all ${
                  mockRole === 'carrier'
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--border)] hover:border-[var(--primary)]'
                }`}
              >
                🚛 Vận tải (Carrier)
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('host@stockflow.b2b')
                  setPassword('Password123!')
                  setMockRole('host')
                }}
                className={`p-2 rounded-lg border text-left font-medium transition-all ${
                  mockRole === 'host'
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--border)] hover:border-[var(--primary)]'
                }`}
              >
                👔 Điều phối (Host)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email-input" className="sf-label">
              Email
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sf-input"
              style={{ borderRadius: 'var(--radius-lg)' }}
              placeholder="name@company.com"
              required={mockRole === 'none'}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password-input" className="sf-label mb-0">
                Mật khẩu
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sf-input"
              style={{ borderRadius: 'var(--radius-lg)' }}
              placeholder="••••••••"
              required={mockRole === 'none'}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sf-btn sf-btn-primary w-full py-3"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              fontSize: '0.9375rem',
              fontWeight: 'bold',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
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
            <p className="sf-msg-error-banner text-center" role="alert">
              {error}
            </p>
          )}
        </form>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: 'var(--ink-secondary)' }}
        >
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-bold text-[var(--primary)] hover:underline"
          >
            Đăng ký doanh nghiệp
          </Link>
        </p>
      </section>
    </main>
  )
}
