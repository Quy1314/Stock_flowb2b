'use client'

export type Language = 'vi' | 'ja'

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  vi: {
    // Roles
    'role.seller': 'Người bán (Seller)',
    'role.buyer': 'Người mua (Buyer)',
    'role.host': 'Điều phối viên (Host)',
    'role.carrier': 'Đơn vị vận tải (Carrier)',

    // Tabs
    'tab.overview': 'Tổng quan',
    'tab.listings': 'Sản phẩm của tôi',
    'tab.requests': 'Đơn mua từ khách',
    'tab.warehouses': 'Cài đặt Kho',
    'tab.customer_warehouses': 'Quản lý Kho nhận',
    'tab.marketplace': 'Chợ sỉ B2B',
    'tab.customer_requests': 'Yêu cầu & Đơn hàng',
    'tab.moderation': 'Duyệt tin đăng',
    'tab.logistics': 'Logistics Center',
    'tab.orders': 'Đơn hàng (Orders)',
    'tab.shipments': 'Vận đơn (Shipments)',
    'tab.trips': 'Yêu cầu Vận chuyển',
    'tab.capacity': 'Cập nhật Năng lực',

    // Buttons & Actions
    'action.logout': 'Đăng xuất',
    'action.add_new': 'Thêm mới',
    'action.cancel': 'Hủy',
    'action.confirm': 'Xác nhận',
    'action.close': 'Đóng',
    'action.search': 'Tìm kiếm',
    'lang.label': 'Ngôn ngữ',
  },
  ja: {
    // Roles
    'role.seller': '売り手 (Seller)',
    'role.buyer': '買い手 (Buyer)',
    'role.host': 'コーディネーター (Host)',
    'role.carrier': '配送業者 (Carrier)',

    // Tabs
    'tab.overview': '概要 (Overview)',
    'tab.listings': '出品商品 (Listings)',
    'tab.requests': '購入リクエスト (Requests)',
    'tab.warehouses': '倉庫設定 (Warehouses)',
    'tab.customer_warehouses': '受取倉庫管理 (Warehouses)',
    'tab.marketplace': 'B2B卸売市場 (Marketplace)',
    'tab.customer_requests': 'リクエスト & 注文 (Orders)',
    'tab.moderation': '掲載承認 (Moderation)',
    'tab.logistics': '物流センター (Logistics)',
    'tab.orders': '注文管理 (Orders)',
    'tab.shipments': '配送伝票 (Shipments)',
    'tab.trips': '配送リクエスト (Trips)',
    'tab.capacity': '車両能力更新 (Capacity)',

    // Buttons & Actions
    'action.logout': 'ログアウト',
    'action.add_new': '新規追加',
    'action.cancel': 'キャンセル',
    'action.confirm': '確認',
    'action.close': '閉じる',
    'action.search': '検索',
    'lang.label': '言語',
  },
}

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'vi'
  return (localStorage.getItem('stockflow-lang') as Language) || 'vi'
}

export function setLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('stockflow-lang', lang)
    window.dispatchEvent(new CustomEvent('stockflow-lang-changed', { detail: lang }))
  }
}

export function t(key: string, lang?: Language): string {
  const currentLang = lang || getLanguage()
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['vi'][key] || key
}
