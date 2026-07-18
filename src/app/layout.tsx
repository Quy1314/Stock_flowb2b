import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StockFlow B2B — Nền tảng kết nối Người Bán & Người Mua",
  description:
    "StockFlow B2B giúp doanh nghiệp kết nối trực tiếp giữa nhà cung cấp và người mua sỉ, quản lý kho hàng, đặt hàng B2B, và vận chuyển logistics trên một nền tảng duy nhất.",
  keywords: [
    "B2B marketplace",
    "quản lý kho",
    "đặt hàng sỉ",
    "logistics",
    "supply chain",
    "StockFlow",
  ],
  openGraph: {
    title: "StockFlow B2B — Nền tảng kết nối Người Bán & Người Mua",
    description:
      "Kết nối doanh nghiệp, quản lý kho hàng, và đặt hàng B2B trên một nền tảng duy nhất.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${outfit.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "StockFlow B2B",
              description:
                "Nền tảng kết nối Người Bán & Người Mua B2B — quản lý kho, đặt hàng sỉ, logistics.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "VND",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
