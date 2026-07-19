'use client'

import React, { useEffect, useState } from 'react'
import Link from "next/link";
import { getLanguage, setLanguage, t, Language } from "@/utils/i18n";

export default function Home() {
  const [lang, setLangState] = useState<Language>('vi')

  useEffect(() => {
    setLangState(getLanguage())
    const handleLangChange = (e: any) => setLangState(e.detail || getLanguage())
    window.addEventListener('stockflow-lang-changed', handleLangChange)
    return () => window.removeEventListener('stockflow-lang-changed', handleLangChange)
  }, [])

  const handleSelectLanguage = (newLang: Language) => {
    setLanguage(newLang)
    setLangState(newLang)
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        {/* Decorative gradient orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--primary)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--accent)" }}
        />

        <nav
          className="sf-container flex items-center justify-between py-5"
          aria-label="Điều hướng chính"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold no-underline"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--ink)",
            }}
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold"
              style={{
                background: "var(--primary)",
                color: "var(--ink-on-primary)",
              }}
            >
              SF
            </span>
            StockFlow
          </Link>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[var(--surface-sunken)] border border-[var(--border)] rounded-lg p-1 text-xs">
              <button
                type="button"
                onClick={() => handleSelectLanguage('vi')}
                className={`px-2 py-1 rounded font-bold transition-colors ${lang === 'vi' ? 'bg-[var(--primary)] text-white' : 'text-[var(--ink-secondary)]'}`}
              >
                🇻🇳 VI
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('ja')}
                className={`px-2 py-1 rounded font-bold transition-colors ${lang === 'ja' ? 'bg-[var(--primary)] text-white' : 'text-[var(--ink-secondary)]'}`}
              >
                🇯🇵 JA
              </button>
            </div>

            <Link
              href="/login"
              className="sf-btn sf-btn-ghost"
              style={{ fontSize: "0.875rem" }}
            >
              {lang === 'ja' ? 'ログイン' : 'Đăng nhập'}
            </Link>
            <Link href="/register" className="sf-btn sf-btn-primary">
              {lang === 'ja' ? '無料で始める' : 'Bắt đầu miễn phí'}
            </Link>
          </div>
        </nav>

        <section className="sf-container pb-24 pt-20 text-center animate-fade-up">
          <div className="mx-auto max-w-3xl">
            <span className="sf-badge sf-badge-primary mb-6 inline-block animate-fade-down">
              Nền tảng B2B #1 Việt Nam
            </span>
            <h1
              className="mb-6"
              style={{ color: "var(--ink)" }}
            >
              Kết nối{" "}
              <span style={{ color: "var(--primary)" }}>Nhà Cung Cấp</span>{" "}
              và{" "}
              <span style={{ color: "var(--primary)" }}>Người Mua Sỉ</span>
              <br />
              trên một nền tảng duy nhất
            </h1>
            <p
              className="mx-auto mb-10 text-lg leading-relaxed delay-1 animate-fade-up"
              style={{
                maxWidth: "42rem",
                color: "var(--ink-secondary)",
              }}
            >
              StockFlow giúp doanh nghiệp quản lý kho hàng, đăng sản phẩm,
              đặt hàng sỉ, và vận chuyển logistics — tất cả được kiểm duyệt
              bởi đội ngũ điều phối chuyên nghiệp.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row delay-2 animate-fade-up">
              <Link
                href="/register"
                className="sf-btn sf-btn-primary sf-btn-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                Đăng ký doanh nghiệp
              </Link>
              <Link
                href="/login"
                className="sf-btn sf-btn-secondary sf-btn-lg"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        {/* ── Features ────────────────────────────────────── */}
        <section
          className="sf-section"
          style={{ background: "var(--surface-sunken)" }}
          aria-labelledby="features-heading"
        >
          <div className="sf-container">
            <div className="mb-12 text-center">
              <h2 id="features-heading" style={{ color: "var(--ink)" }}>
                Tại sao chọn StockFlow?
              </h2>
              <p
                className="mx-auto mt-4"
                style={{ color: "var(--ink-secondary)" }}
              >
                Một nền tảng — ba vai trò — toàn bộ chuỗi cung ứng B2B.
              </p>
            </div>

            <div className="sf-grid-features">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 7h-9" /><path d="M14 17H5" />
                      <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
                    </svg>
                  ),
                  title: "Quản lý kho thông minh",
                  desc: "Seller đăng kho hàng, quản lý sản phẩm, và theo dõi trạng thái kiểm duyệt — mọi thứ một chỗ.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  ),
                  title: "Đặt hàng sỉ dễ dàng",
                  desc: "Buyer duyệt marketplace, gửi yêu cầu mua, xác nhận báo giá logistics, và theo dõi đơn hàng.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  ),
                  title: "Kiểm duyệt tin cậy",
                  desc: "Host xác minh listing, kết nối Buyer–Seller, quản lý logistics và thanh toán an toàn.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  ),
                  title: "Logistics tích hợp",
                  desc: "Báo giá vận chuyển, theo dõi giao hàng, cập nhật trạng thái real-time từ Host.",
                },
              ].map((feature, i) => (
                <article
                  key={i}
                  className={`sf-card sf-card-interactive animate-fade-up delay-${i + 1}`}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{
                      background: "var(--primary-subtle)",
                      color: "var(--primary)",
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3
                    className="mb-2"
                    style={{ fontSize: "1.125rem", color: "var(--ink)" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--ink-secondary)",
                      margin: 0,
                    }}
                  >
                    {feature.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ────────────────────────────────── */}
        <section
          className="sf-section"
          aria-labelledby="how-it-works-heading"
        >
          <div className="sf-container">
            <div className="mb-16 text-center">
              <h2 id="how-it-works-heading" style={{ color: "var(--ink)" }}>
                Bắt đầu trong 3 bước
              </h2>
              <p
                className="mx-auto mt-4"
                style={{ color: "var(--ink-secondary)" }}
              >
                Từ đăng ký đến giao hàng — chỉ cần vài phút.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Đăng ký doanh nghiệp",
                  desc: "Tạo tài khoản Seller hoặc Buyer với thông tin doanh nghiệp và mã số thuế.",
                },
                {
                  step: "02",
                  title: "Đăng hàng hoặc đặt mua",
                  desc: "Seller đăng sản phẩm lên marketplace. Buyer tìm kiếm và gửi yêu cầu mua.",
                },
                {
                  step: "03",
                  title: "Giao dịch an toàn",
                  desc: "Host kiểm duyệt, kết nối hai bên, báo giá logistics, và tạo đơn hàng.",
                },
              ].map((item, i) => (
                <article
                  key={i}
                  className={`relative text-center animate-fade-up delay-${i + 1}`}
                >
                  <div
                    className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
                    style={{
                      background: "var(--primary)",
                      color: "var(--ink-on-primary)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="mb-3" style={{ color: "var(--ink)" }}>
                    {item.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--ink-secondary)",
                      margin: "0 auto",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <section
          className="sf-section text-center"
          style={{ background: "var(--primary)" }}
          aria-labelledby="cta-heading"
        >
          <div className="sf-container">
            <h2
              id="cta-heading"
              className="mb-4"
              style={{ color: "var(--ink-on-primary)" }}
            >
              Sẵn sàng phát triển kinh doanh B2B?
            </h2>
            <p
              className="mx-auto mb-8"
              style={{
                color: "oklch(0.92 0 0 / 0.85)",
                maxWidth: "36rem",
              }}
            >
              Tham gia cùng hàng trăm doanh nghiệp đang sử dụng StockFlow để
              kết nối, mua bán, và vận chuyển hàng hóa B2B.
            </p>
            <Link
              href="/register"
              className="sf-btn sf-btn-lg"
              style={{
                background: "var(--ink-on-primary)",
                color: "var(--primary-dark)",
                fontWeight: 700,
              }}
            >
              Đăng ký miễn phí ngay
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer
        className="py-8"
        style={{
          background: "var(--surface-sunken)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="sf-container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p
            className="text-sm"
            style={{ color: "var(--ink-muted)", margin: 0, maxWidth: "none" }}
          >
            © 2026 StockFlow B2B. Mọi quyền được bảo lưu.
          </p>
          <nav aria-label="Footer links" className="flex gap-6">
            <Link
              href="/login"
              className="text-sm"
              style={{ color: "var(--ink-secondary)" }}
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="text-sm"
              style={{ color: "var(--ink-secondary)" }}
            >
              Đăng ký
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
