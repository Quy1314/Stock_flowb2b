'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState<'seller' | 'customer' | 'host' | 'carrier' | null>(null)
  const [companyName, setCompanyName] = useState('Đang tải...')
  const [userName, setUserName] = useState('Đang tải...')

  useEffect(() => {
    // 1. Detect role from path
    const pathParts = pathname.split('/')
    const detectedRole = pathParts[2] as 'seller' | 'customer' | 'host' | 'carrier'
    if (['seller', 'customer', 'host', 'carrier'].includes(detectedRole)) {
      setRole(detectedRole)
    }

    // 2. Mock profile values or read from local storage / cookie
    const isMock = document.cookie.includes('sb-mock-role')
    if (isMock) {
      if (detectedRole === 'seller') {
        setCompanyName('ABC Packaging JSC')
        setUserName('Nguyễn Văn Bán')
      } else if (detectedRole === 'customer') {
        setCompanyName('Minh Phong Retail Co.')
        setUserName('Trần Văn Mua')
      } else if (detectedRole === 'host') {
        setCompanyName('Ban Quản Trị StockFlow')
        setUserName('Admin Điều Phối')
      } else if (detectedRole === 'carrier') {
        setCompanyName('Vận tải Minh Phát')
        setUserName('Nguyễn Vận Tải')
      }
    } else {
      // In real mode, use default titles or fetch async
      setCompanyName('Doanh nghiệp thành viên')
      setUserName('Đại diện')
    }
  }, [pathname])

  const handleLogout = () => {
    // Clear mock cookie
    document.cookie = 'sb-mock-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    // Clear Supabase session if any (would normally call action, here we can redirect to login)
    router.push('/login')
  }

  // Sidebar Menu items by role
  const getMenuItems = () => {
    if (role === 'seller') {
      return [
        { label: '📊 Tổng quan', href: '/dashboard/seller#overview' },
        { label: '📦 Sản phẩm của tôi', href: '/dashboard/seller#listings' },
        { label: '📥 Đơn mua từ khách', href: '/dashboard/seller#requests' },
        { label: '⚙️ Cài đặt Kho', href: '/dashboard/seller#warehouses' },
      ]
    }
    if (role === 'customer') {
      return [
        { label: '📊 Tổng quan', href: '/dashboard/customer#overview' },
        { label: '🛒 Chợ sỉ B2B', href: '/dashboard/customer#marketplace' },
        { label: '📦 Yêu cầu & Đơn hàng', href: '/dashboard/customer#requests' },
        { label: '⚙️ Quản lý Kho nhận', href: '/dashboard/customer#warehouses' },
      ]
    }
    if (role === 'host') {
      return [
        { label: '📊 Tổng quan', href: '/dashboard/host#overview' },
        { label: '🔎 Duyệt tin đăng', href: '/dashboard/host#moderation' },
        { label: '🚚 Logistics Center', href: '/dashboard/host#logistics' },
        { label: '🛒 Đơn hàng (Orders)', href: '/dashboard/host#orders' },
        { label: '📈 Vận đơn (Shipments)', href: '/dashboard/host#shipments' },
      ]
    }
    if (role === 'carrier') {
      return [
        { label: '📊 Tổng quan', href: '/dashboard/carrier#overview' },
        { label: '🚚 Yêu cầu Vận chuyển', href: '/dashboard/carrier#trips' },
        { label: '⚙️ Cập nhật Năng lực', href: '/dashboard/carrier#capacity' },
      ]
    }
    return []
  }

  const roleLabels = {
    seller: 'Người bán (Seller)',
    customer: 'Người mua (Customer)',
    host: 'Điều phối viên (Host)',
    carrier: 'Đơn vị vận tải (Carrier)',
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg)] text-[var(--ink)]">
      {/* ── Sidebar ── */}
      <aside
        className="w-full md:w-64 flex-shrink-0 flex flex-col p-6 border-b md:border-b-0 md:border-r border-[var(--border)] animate-fade-in"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold no-underline text-[var(--ink)]">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold"
              style={{
                background: 'var(--primary)',
                color: 'var(--ink-on-primary)',
              }}
            >
              SF
            </span>
            StockFlow
          </Link>
          <span className="md:hidden text-xs px-2.5 py-1 rounded bg-[var(--primary-subtle)] text-[var(--primary-dark)] font-semibold">
            {role ? role.toUpperCase() : ''}
          </span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {getMenuItems().map((item, idx) => {
            const isActive = pathname === item.href.split('#')[0]
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-[var(--primary-subtle)] hover:text-[var(--primary-dark)] text-[var(--ink-secondary)]"
                style={{
                  background: isActive ? 'var(--primary-subtle)' : 'transparent',
                  color: isActive ? 'var(--primary-dark)' : undefined,
                  fontWeight: isActive ? '600' : undefined,
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header
          className="h-16 border-b border-[var(--border)] px-6 md:px-8 flex items-center justify-between"
          style={{ background: 'var(--surface)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                background: 'var(--primary)',
                color: 'var(--ink-on-primary)',
              }}
            >
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold m-0" style={{ color: 'var(--ink)' }}>
                {companyName}
              </h4>
              <span className="text-xs text-[var(--ink-muted)] block">
                {role ? roleLabels[role] : ''}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="sf-btn sf-btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
