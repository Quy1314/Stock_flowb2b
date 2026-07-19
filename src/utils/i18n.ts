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

    // Titles & Headers
    'title.welcome_seller': 'Chào mừng trở lại, Seller!',
    'title.welcome_buyer': 'Chào mừng trở lại, Buyer!',
    'title.welcome_host': 'Chào mừng trở lại, Coordinator!',
    'title.welcome_carrier': 'Chào mừng trở lại, Carrier!',
    'sub.seller_desc': 'Quản lý kho hàng dư thừa & thanh lý B2B nhanh chóng.',
    'sub.buyer_desc': 'Khám phá thị trường B2B và quản lý đơn đặt hàng của doanh nghiệp.',
    'sub.host_desc': 'Duyệt tin đăng, điều phối vận tải & kiểm soát đơn hàng sàn StockFlow.',
    'sub.carrier_desc': 'Quản lý các chuyến vận chuyển và cập nhật năng lực phương tiện.',

    // Metrics
    'metric.total_listings': 'Tổng lượng hàng đăng bán',
    'metric.pending_requests': 'Đơn mua chờ phản hồi',
    'metric.active_warehouses': 'Kho đang hoạt động',
    'metric.buyer_pending_requests': 'Đang yêu cầu mua',
    'metric.buyer_confirmed_orders': 'Đơn hàng đã chốt',
    'metric.marketplace_available': 'Sản phẩm khả dụng trên sàn',
    'metric.host_pending_moderation': 'Bài đăng chờ kiểm duyệt',
    'metric.host_pending_orders': 'Đơn mua chờ xử lý',
    'metric.host_in_transit': 'Đơn vận chuyển đang đi',
    'metric.carrier_available_trips': 'Chuyến hàng khả dụng',
    'metric.carrier_my_trips': 'Chuyến hàng đang đảm nhận',

    // Section Titles
    'sec.my_listings': 'Sản phẩm của tôi',
    'sec.customer_requests': 'Đơn mua từ khách hàng',
    'sec.warehouses': 'Danh sách kho hàng doanh nghiệp',
    'sec.buyer_warehouses': 'Kho hàng tiếp nhận',
    'sec.marketplace': 'Chợ sỉ B2B — Sản phẩm thanh lý trực tiếp từ nhà máy',
    'sec.moderation': 'Hàng chờ kiểm duyệt sản phẩm thanh lý',
    'sec.logistics': 'Báo giá cước & Điều phối Logistics',
    'sec.orders': 'Danh sách Đơn hàng (Orders)',
    'sec.shipments': 'Theo dõi Vận đơn (Shipments)',
    'sec.trips': 'Chuyến hàng đang tìm đối tác vận chuyển',

    // Table Headers
    'th.product_name': 'Tên sản phẩm',
    'th.category': 'Danh mục',
    'th.quantity': 'Số lượng',
    'th.unit_price': 'Đơn giá',
    'th.lot_number': 'Số lô',
    'th.status': 'Trạng thái',
    'th.customer': 'Khách hàng',
    'th.proposed_price': 'Đơn giá đề xuất',
    'th.notes': 'Ghi chú',
    'th.actions': 'Hành động',
    'th.address': 'Địa chỉ',
    'th.phone': 'Điện thoại',
    'th.seller': 'Người bán',
    'th.location': 'Khu vực',
    'th.pickup': 'Điểm lấy',
    'th.drop': 'Điểm giao',
    'th.truck': 'Loại xe',

    // Buttons & Actions
    'action.logout': 'Đăng xuất',
    'action.add_new': 'Thêm mới',
    'action.add_warehouse': 'Thiết lập kho mới',
    'action.cancel': 'Hủy',
    'action.confirm': 'Xác nhận',
    'action.close': 'Đóng',
    'action.search': 'Tìm kiếm',
    'action.filter': 'Lọc chuyến hàng',
    'action.agree': 'Đồng ý',
    'action.reject': 'Từ chối',
    'action.quote': 'Báo giá',
    'action.details': 'Chi tiết',
    'action.buy_now': 'Đăng ký mua ngay',
    'action.pay': 'Thanh toán chuyển khoản',
    'lang.label': 'Ngôn ngữ',

    // Status Badges
    'status.approved': 'Đã duyệt',
    'status.pending_review': 'Chờ duyệt',
    'status.rejected': 'Từ chối',
    'status.submitted': 'Chờ phản hồi',
    'status.seller_confirmed': 'Đã đồng ý',
    'status.seller_rejected': 'Đã từ chối',
    'status.quoted': 'Đã báo giá',
    'status.awaiting_payment': 'Chờ thanh toán',
    'status.paid': 'Đã thanh toán',
    'status.in_transit': 'Đang vận chuyển',
    'status.delivered': 'Đã giao hàng thành công',
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

    // Titles & Headers
    'title.welcome_seller': 'おかえりなさい、Seller!',
    'title.welcome_buyer': 'おかえりなさい、Buyer!',
    'title.welcome_host': 'おかえりなさい、Coordinator!',
    'title.welcome_carrier': 'おかえりなさい、Carrier!',
    'sub.seller_desc': '余剰在庫とB2B処分品の迅速な管理と販売。',
    'sub.buyer_desc': 'B2B卸売市場の探索と企業注文の管理。',
    'sub.host_desc': '出品承認、配送調整、およびStockFlow注文の管理。',
    'sub.carrier_desc': '配送リクエストの管理と車両の対応能力の更新。',

    // Metrics
    'metric.total_listings': '出品総数',
    'metric.pending_requests': '回答待ちの購入注文',
    'metric.active_warehouses': '稼働中倉庫数',
    'metric.buyer_pending_requests': '購入リクエスト中',
    'metric.buyer_confirmed_orders': '確定済み注文',
    'metric.marketplace_available': '市場の販売可能商品',
    'metric.host_pending_moderation': '承認待ちの出品',
    'metric.host_pending_orders': '処理待ちの注文',
    'metric.host_in_transit': '配送中の案件',
    'metric.carrier_available_trips': '応募可能な配送案件',
    'metric.carrier_my_trips': '担当中の配送案件',

    // Section Titles
    'sec.my_listings': 'マイ出品商品一覧',
    'sec.customer_requests': 'バイヤーからの購入注文',
    'sec.warehouses': '企業倉庫一覧',
    'sec.buyer_warehouses': '受取倉庫一覧',
    'sec.marketplace': 'B2B卸売市場 — 工場直送の処分品・余剰在庫',
    'sec.moderation': '出品承認待ちリスト',
    'sec.logistics': '運賃見積もり & 物流調整センター',
    'sec.orders': '注文一覧 (Orders List)',
    'sec.shipments': '配送伝票追跡 (Shipment Tracking)',
    'sec.trips': '配送パートナー募集中の案件',

    // Table Headers
    'th.product_name': '商品名',
    'th.category': 'カテゴリ',
    'th.quantity': '数量',
    'th.unit_price': '単価',
    'th.lot_number': 'ロット番号',
    'th.status': 'ステータス',
    'th.customer': 'バイヤー企業',
    'th.proposed_price': '希望提示単価',
    'th.notes': '備考',
    'th.actions': '操作',
    'th.address': '住所',
    'th.phone': '電話番号',
    'th.seller': '売り手企業',
    'th.location': '地域・拠点',
    'th.pickup': '集荷場所',
    'th.drop': '配送先',
    'th.truck': '車両タイプ',

    // Buttons & Actions
    'action.logout': 'ログアウト',
    'action.add_new': '➕ 新規出品',
    'action.add_warehouse': '➕ 倉庫追加',
    'action.cancel': 'キャンセル',
    'action.confirm': '確認',
    'action.close': '閉じる',
    'action.search': '検索',
    'action.filter': '案件を絞り込み',
    'action.agree': '承認 (同意)',
    'action.reject': '辞退',
    'action.quote': '見積もり送信',
    'action.details': '詳細表示',
    'action.buy_now': '購入リクエスト',
    'action.pay': '銀行振込で支払う',
    'lang.label': '言語 (Language)',

    // Status Badges
    'status.approved': '承認済み',
    'status.pending_review': '承認待ち',
    'status.rejected': '却下',
    'status.submitted': '回答待ち',
    'status.seller_confirmed': '売り手同意済み',
    'status.seller_rejected': '売り手辞退',
    'status.quoted': '見積提出済み',
    'status.awaiting_payment': '支払い待ち',
    'status.paid': '支払い完了',
    'status.in_transit': '配送中',
    'status.delivered': '配達完了',
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
