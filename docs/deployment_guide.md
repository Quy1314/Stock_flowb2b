# Hướng dẫn Triển khai Hệ thống StockFlow B2B (Vercel & Supabase)

Tài liệu này hướng dẫn chi tiết cách triển khai dự án StockFlow B2B lên môi trường Cloud/Production sử dụng **Vercel** (cho Frontend Next.js) và **Supabase** (cho Backend cơ sở dữ liệu PostgreSQL & Auth).

---

## 1. Triển khai Cơ sở dữ liệu & Auth (Supabase Backend)

StockFlow sử dụng Supabase làm backend cơ sở dữ liệu (PostgreSQL), hệ thống lưu trữ, hàng đợi RLS (Row Level Security), và quản lý tài khoản người dùng (Auth).

### Bước 1: Khởi tạo Project Supabase
1. Truy cập [Supabase](https://supabase.com) và đăng nhập bằng tài khoản của bạn (hoặc GitHub).
2. Nhấp vào **New Project**, chọn Organization của bạn.
3. Điền các thông tin:
   - **Name**: `stockflow-b2b`
   - **Database Password**: Nhập mật khẩu mạnh (lưu lại thông tin này).
   - **Region**: Chọn khu vực gần Việt Nam nhất (ví dụ: `Singapore - ap-southeast-1`).
4. Bấm **Create new project** và đợi vài phút để hệ thống khởi tạo.

### Bước 2: Chạy Script SQL Schema
1. Trong trang quản lý Supabase, chọn mục **SQL Editor** ở thanh menu bên trái.
2. Bấm chọn **New Query** (Blank Query).
3. Mở file `docs/stockflow_supabase.sql`, copy toàn bộ mã nguồn SQL.
4. Paste nội dung vào ô soạn thảo truy vấn của Supabase SQL Editor.
5. Nhấp nút **Run** ở góc phải màn hình.
6. Xác nhận kết quả hiển thị thông báo chạy thành công (`Success. No rows returned`). Hệ thống sẽ tự động tạo cấu trúc bảng, các trigger, phân cấp quan hệ, và các chính sách bảo mật dòng (RLS policies).

### Bước 3: Lấy khóa API & Kết nối
1. Đi tới **Project Settings** (biểu tượng bánh răng ở góc dưới bên trái).
2. Chọn mục **API**.
3. Sao chép và lưu trữ hai giá trị sau (dùng để cấu hình Vercel ở phần sau):
   - **Project URL**: Ví dụ `https://xyz.supabase.co`
   - **API Key (anon/public)**: Khóa ẩn danh công khai.

---

## 2. Triển khai Ứng dụng Next.js (Vercel Frontend)

### Bước 1: Push mã nguồn lên GitHub
1. Mở Terminal tại thư mục dự án và đảm bảo mã nguồn đã được commit:
   ```bash
   git add .
   git commit -m "feat: complete carrier integration and dynamic warnings"
   ```
2. Đẩy mã nguồn lên nhánh chính trên GitHub:
   ```bash
   git push origin main
   ```

### Bước 2: Tạo project mới trên Vercel
1. Truy cập trang chủ [Vercel](https://vercel.com) và đăng nhập bằng tài khoản GitHub liên kết.
2. Bấm chọn **Add New...** -> **Project**.
3. Danh sách kho lưu trữ GitHub sẽ xuất hiện. Chọn repository `Huy_project` và nhấp nút **Import**.

### Bước 3: Cấu hình biến môi trường (Environment Variables)
Trong màn hình cấu hình trước khi Deploy, mở rộng phần **Environment Variables** và thêm các biến môi trường sau bằng cách copy từ bước Supabase ở trên:

| Tên biến (Key) | Giá trị mẫu (Value) | Giải thích |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | URL kết nối dịch vụ API Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | API Key Public Anon |

---

## 3. Cơ chế Mock Role (Chạy Thử Nghiệm)

Dự án có tích hợp cơ chế bypass xác thực dành cho nhà phát triển/kiểm thử để xem nhanh các màn hình giao diện của từng vai trò mà không cần đăng ký tài khoản Supabase thật:

1. Truy cập trang `/login` trên sản phẩm đã deploy.
2. Kéo xuống phần **🔧 Dành cho Lập trình viên**.
3. Chọn vai trò mô phỏng tương ứng:
   - **Người mua (Customer)** -> Xem các tính năng chợ sỉ, tìm kiếm, chốt cước.
   - **Người bán (Seller)** -> Thử form đăng hàng, đính kèm chứng từ, nhận cảnh báo thực phẩm.
   - **Đơn vị vận tải (Carrier)** -> Xem và gửi báo giá chuyến vận chuyển, tải POD.
   - **Điều phối viên (Host)** -> Phê duyệt bài đăng, nhập cước logistics.
4. Nhấp chọn và hệ thống sẽ lưu cookie giả lập `sb-mock-role` để tự động chuyển hướng trực tiếp vào giao diện dashboard tương ứng.

---

## 4. Quy trình Thanh toán chuyển khoản (Manual Bank Transfer)

MVP tích hợp luồng chuyển khoản ngân hàng thủ công:
1. Buyer chốt đơn mua hàng -> Trạng thái đổi thành `awaiting_payment`.
2. Buyer tải lên biên lai chuyển khoản vào Storage bucket `payment-receipts`.
3. Host (Coordinators) kiểm tra ảnh chụp biên lai và bấm nút "Xác nhận đã nhận tiền".
4. Đơn hàng chuyển sang trạng thái `paid`.
