'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { registerUser } from '@/app/actions/auth'

export default function RegisterPage() {
  const [role, setRole] = useState<'seller' | 'customer' | 'carrier'>('customer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [taxCode, setTaxCode] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!email || !email.includes('@')) {
      newErrors.email = 'Email không hợp lệ'
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự'
    }
    if (!fullName) {
      newErrors.fullName = 'Vui lòng nhập họ và tên'
    }
    if (role === 'seller' || role === 'customer' || role === 'carrier') {
      if (!companyName) {
        newErrors.companyName = 'Vui lòng nhập tên doanh nghiệp'
      }
      if (!taxCode) {
        newErrors.taxCode = 'Vui lòng nhập mã số thuế'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setMessage('')
    try {
      const res = await registerUser({
        email,
        fullName,
        role,
        companyName,
        taxCode,
        phone,
        address,
        city,
      })

      if (res.success) {
        setMessage('Đăng ký thành công!')
      } else {
        setMessage(`Lỗi: ${res.error}`)
      }
    } catch (err: any) {
      setMessage(`Có lỗi xảy ra: ${err.message || err}`)
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
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[var(--primary)] opacity-20 blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-[var(--accent)] opacity-10 blur-[80px]" />
      </div>

      <section
        className="relative z-10 w-full rounded-2xl p-8 md:p-10 shadow-2xl transition-all duration-300 animate-scale-in"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 128, 128, 0.15)',
          boxShadow: '0 20px 40px oklch(0.18 0.02 180 / 0.08)',
          maxWidth: '36rem',
        }}
      >
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
            Đăng ký tài khoản
          </h1>
          <p
            className="mx-auto mt-2"
            style={{
              fontSize: '0.9375rem',
              color: 'var(--ink-secondary)',
              margin: '0.5rem auto 0',
            }}
          >
            Tạo tài khoản doanh nghiệp mới trên StockFlow.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up delay-1">
          {/* ── Account Info ──────────────────────────────── */}
          <fieldset className="space-y-4" style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend
              className="mb-3 text-sm font-semibold"
              style={{
                color: 'var(--ink)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.02em',
              }}
            >
              Thông tin tài khoản
            </legend>

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
                autoComplete="email"
              />
              {errors.email && <p className="sf-msg-error">{errors.email}</p>}
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
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
              />
              {errors.password && <p className="sf-msg-error">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="name-input" className="sf-label">
                Họ và tên người đại diện
              </label>
              <input
                id="name-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="sf-input"
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
              {errors.fullName && <p className="sf-msg-error">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="role-select" className="sf-label">
                Vai trò
              </label>
              <select
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as 'seller' | 'customer' | 'carrier')}
                className="sf-select"
              >
                <option value="customer">Người mua (Customer)</option>
                <option value="seller">Người bán (Seller)</option>
                <option value="carrier">Đơn vị vận tải (Carrier)</option>
              </select>
            </div>
          </fieldset>

          <hr className="sf-divider" />

          {/* ── Business Info ─────────────────────────────── */}
          <fieldset className="space-y-4" style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend
              className="mb-3 text-sm font-semibold"
              style={{
                color: 'var(--ink)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.02em',
              }}
            >
              Thông tin doanh nghiệp
            </legend>

            <div>
              <label htmlFor="company-input" className="sf-label">
                Tên doanh nghiệp
              </label>
              <input
                id="company-input"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="sf-input"
                placeholder="Công ty TNHH StockFlow"
                autoComplete="organization"
              />
              {errors.companyName && <p className="sf-msg-error">{errors.companyName}</p>}
            </div>

            <div>
              <label htmlFor="tax-input" className="sf-label">
                Mã số thuế
              </label>
              <input
                id="tax-input"
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                className="sf-input"
                placeholder="0123456789"
              />
              {errors.taxCode && <p className="sf-msg-error">{errors.taxCode}</p>}
            </div>

            <div>
              <label htmlFor="phone-input" className="sf-label">
                Số điện thoại liên hệ
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="sf-input"
                placeholder="0987654321"
                autoComplete="tel"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="address-input" className="sf-label">
                  Địa chỉ trụ sở
                </label>
                <input
                  id="address-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="sf-input"
                  placeholder="123 Đường A"
                  autoComplete="street-address"
                />
              </div>

              <div>
                <label htmlFor="city-input" className="sf-label">
                  Thành phố / Tỉnh
                </label>
                <input
                  id="city-input"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="sf-input"
                  placeholder="Hà Nội"
                  autoComplete="address-level1"
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="sf-btn sf-btn-primary w-full"
            style={{
              padding: 'var(--space-4) var(--space-6)',
              fontSize: '1rem',
              marginTop: 'var(--space-6)',
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
                Đang đăng ký…
              </span>
            ) : (
              'Đăng ký'
            )}
          </button>

          {message && (
            <p
              className={
                message.startsWith('Lỗi')
                  ? 'sf-msg-error-banner'
                  : 'sf-msg-success'
              }
              role="status"
            >
              {message}
            </p>
          )}
        </form>

        <p
          className="mt-8 text-center text-sm animate-fade-up delay-2"
          style={{ color: 'var(--ink-secondary)' }}
        >
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  )
}
