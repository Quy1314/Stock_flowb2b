'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

/** Tab definitions per role */
const ROLE_TABS: Record<string, { id: string; label: string; icon: string }[]> = {
  seller: [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'listings', label: 'Sản phẩm của tôi', icon: '📦' },
    { id: 'requests', label: 'Đơn mua từ khách', icon: '📥' },
    { id: 'warehouses', label: 'Cài đặt Kho', icon: '⚙️' },
  ],
  customer: [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'marketplace', label: 'Chợ sỉ B2B', icon: '🛒' },
    { id: 'requests', label: 'Yêu cầu & Đơn hàng', icon: '📦' },
    { id: 'warehouses', label: 'Quản lý Kho nhận', icon: '⚙️' },
  ],
  host: [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'moderation', label: 'Duyệt tin đăng', icon: '🔎' },
    { id: 'logistics', label: 'Logistics Center', icon: '🚚' },
    { id: 'orders', label: 'Đơn hàng (Orders)', icon: '🛒' },
    { id: 'shipments', label: 'Vận đơn (Shipments)', icon: '📈' },
  ],
  carrier: [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'trips', label: 'Yêu cầu Vận chuyển', icon: '🚚' },
    { id: 'capacity', label: 'Cập nhật Năng lực', icon: '⚙️' },
  ],
}

const ROLE_LABELS: Record<string, string> = {
  seller: 'Người bán (Seller)',
  customer: 'Người mua (Customer)',
  host: 'Điều phối viên (Host)',
  carrier: 'Đơn vị vận tải (Carrier)',
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const pathParts = pathname.split('/')
    const detectedRole = pathParts[2] as 'seller' | 'customer' | 'host' | 'carrier'
    if (['seller', 'customer', 'host', 'carrier'].includes(detectedRole)) {
      setRole(detectedRole)
    }

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
      setCompanyName('Doanh nghiệp thành viên')
      setUserName('Đại diện')
    }
  }, [pathname])

  const handleLogout = () => {
    document.cookie = 'sb-mock-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/login')
  }

  /** Navigate sidebar: update hash + dispatch hashchange so child pages pick it up */
  const handleTabClick = useCallback((tabId: string) => {
    // Update the URL hash
    window.location.hash = tabId
    // Manually dispatch hashchange so child pages (seller, customer, etc.) can react
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    // Close mobile sidebar
    setSidebarOpen(false)
  }, [])

  const tabs = role ? (ROLE_TABS[role] || []) : []
  const currentHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : 'overview'

  return (
    <div className="sf-dashboard-shell">
      {/* ── Mobile hamburger overlay ── */}
      {sidebarOpen && (
        <div
          className="sf-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sf-sidebar ${sidebarOpen ? 'sf-sidebar--open' : ''}`}>
        <div className="sf-sidebar__header">
          <Link href="/" className="sf-sidebar__brand">
            <span className="sf-sidebar__logo">SF</span>
            StockFlow
          </Link>
          {/* Mobile close */}
          <button
            className="sf-sidebar__close md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng menu"
          >
            ✕
          </button>
        </div>

        <nav className="sf-sidebar__nav">
          {tabs.map((tab) => {
            const isActive = currentHash === tab.id || (!currentHash && tab.id === 'overview')
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`sf-sidebar__item ${isActive ? 'sf-sidebar__item--active' : ''}`}
              >
                <span className="sf-sidebar__item-icon">{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="sf-main-area">
        {/* Top Header */}
        <header className="sf-topbar">
          {/* Mobile hamburger */}
          <button
            className="sf-topbar__hamburger md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <div className="sf-topbar__profile">
            <div className="sf-topbar__avatar">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="sf-topbar__company">{companyName}</h4>
              <span className="sf-topbar__role">{role ? ROLE_LABELS[role] : ''}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="sf-topbar__logout">
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
        <main className="sf-page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
