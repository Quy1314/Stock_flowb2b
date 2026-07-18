# StockFlow B2B — MVP setup

## Tech stack đề xuất

- **Frontend + backend web:** Next.js App Router + TypeScript.
- **UI:** Tailwind CSS; có thể thêm shadcn/ui nếu cần component nhanh.
- **Database, Auth, Storage, Realtime:** Supabase.
- **Deploy web:** Vercel.
- **Email thông báo:** Resend hoặc Supabase Auth email trong giai đoạn MVP.
- **Thanh toán:** MVP ghi nhận trạng thái chuyển khoản thủ công; tích hợp cổng thanh toán sau.
- **Logistics:** Host nhập báo giá và cập nhật trạng thái thủ công; API đối tác triển khai sau khi validate mô hình.

## Cách cài database

1. Tạo project Supabase.
2. Mở **SQL Editor** và chạy toàn bộ file `stockflow_supabase.sql` một lần trên project mới.
3. Vào **Authentication > Providers**, bật Email/Password.
4. Tạo tài khoản Host đầu tiên trong Authentication, sau đó chạy:

```sql
update public.profiles
set role = 'host'
where email = 'host@stockflow.vn';
```

5. Frontend upload file theo cấu trúc:
   - `product-images/<USER_ID>/<FILE_NAME>`
   - `listing-documents/<USER_ID>/<FILE_NAME>`

## Đăng ký, đăng nhập và đăng xuất

Cài thư viện:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Đăng ký Seller:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: 'seller',
      full_name: companyContactName,
    },
  },
})
```

Đăng ký Customer:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: 'customer',
      full_name: buyerContactName,
    },
  },
})
```

Đăng nhập:

```ts
await supabase.auth.signInWithPassword({ email, password })
```

Đăng xuất:

```ts
await supabase.auth.signOut()
```

## RPC theo luồng nghiệp vụ

| Actor | RPC |
|---|---|
| Host | `host_review_listing` |
| Host | `host_assign_purchase_request` |
| Seller | `seller_respond_purchase_request` |
| Host | `host_add_logistics_quote` |
| Buyer | `buyer_confirm_logistics_quote` |
| Buyer | `buyer_cancel_purchase_request` |
| Host | `host_create_order` |

Ví dụ gọi RPC:

```ts
const { data, error } = await supabase.rpc('host_review_listing', {
  p_listing_id: listingId,
  p_approve: true,
  p_reason: null,
})
```

## Màn hình MVP tối thiểu

1. Login / Register.
2. Seller Dashboard: tổ chức, kho, đăng hàng, trạng thái kiểm duyệt, yêu cầu mua.
3. Marketplace: danh sách listing đã duyệt, tìm kiếm/lọc, gửi yêu cầu mua.
4. Host Dashboard: duyệt listing, tiếp nhận lệnh mua, liên hệ Seller, nhập báo giá logistics, tạo đơn, cập nhật thanh toán/giao hàng.
5. Buyer Orders: xác nhận báo giá, xem thanh toán, theo dõi giao hàng.

## Quy ước bảo mật

- Không đưa `SUPABASE_SERVICE_ROLE_KEY` lên trình duyệt.
- Client chỉ dùng public anon key; RLS bảo vệ dữ liệu.
- Các thay đổi trạng thái nhạy cảm dùng RPC trong file SQL thay vì update trực tiếp.
- Role Host không được lấy từ form đăng ký công khai.
