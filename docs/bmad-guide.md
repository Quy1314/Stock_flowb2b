# Hướng Dẫn Sử Dụng BMad Method Skills

**BMad Method (Agile AI-Driven Development)** là quy trình phát triển phần mềm Agile tích hợp trí tuệ nhân tạo (AI), chia làm các phân đoạn rõ ràng từ phân tích, lập kế hoạch, thiết kế kiến trúc đến thực thi code.

Vì các skill này đã được cài đặt vào thư mục `.agents/skills/` của project, công cụ AI (Antigravity hoặc các agent khác) sẽ **tự động nhận diện và sẵn sàng thực hiện** theo yêu cầu của bạn.

---

## 1. Cách Kích Hoạt (Gọi Skill)
Bạn chỉ cần ra lệnh trực tiếp trong chat box với AI. Ví dụ:
- *"Chạy skill bmad-help để hướng dẫn tôi bước tiếp theo"*
- *"Hãy phân tích dự án này bằng bmad-product-brief"*
- *"Mở Party Mode để gọi các agent thảo luận với nhau"*

---

## 2. Quy Trình Phát Triển Chuẩn (4 Giai Đoạn)

Quy trình BMad Method dẫn dắt bạn qua 4 bước phát triển sản phẩm chuyên nghiệp:

### Giai đoạn 1: Phân Tích (Analysis)
Giúp định hình ý tưởng sơ khởi thành các tài liệu đặc tả sản phẩm.
- **`bmad-product-brief`**: Tạo bản tóm tắt sản phẩm (Product Brief).
- **`bmad-prfaq`**: Viết PR/FAQ giả định từ góc nhìn của khách hàng để kiểm tra tính thực tiễn của ý tưởng.
- **`bmad-document-project`**: Tạo tài liệu mô tả hiện trạng cho dự án cũ (brownfield).
- **Các agent hỗ trợ**: 
  - `bmad-agent-analyst` (Mary - Chuyên gia phân tích nghiệp vụ).
  - `bmad-agent-tech-writer` (Paige - Chuyên viên viết tài liệu kỹ thuật).

### Giai đoạn 2: Lập Kế Hoạch (Planning)
Thiết kế luồng trải nghiệm người dùng (UX) và đặc tả tính năng chi tiết.
- **`bmad-prd`**: Tạo, cập nhật và kiểm định tài liệu PRD (Product Requirements Document).
- **`bmad-ux`**: Đặc tả các mẫu trải nghiệm người dùng và luồng tương tác.
- **Các agent hỗ trợ**:
  - `bmad-agent-pm` (John - Quản lý sản phẩm).
  - `bmad-agent-ux-designer` (Sally - Thiết kế trải nghiệm người dùng).

### Giai đoạn 3: Thiết Kế Giải Pháp & Kiến Trúc (Solutioning)
Xác định cấu trúc hệ thống, bất biến kỹ thuật (invariants) và chia nhỏ công việc.
- **`bmad-architecture`**: Xây dựng tài liệu kiến trúc phần mềm cốt lõi.
- **`bmad-create-epics-and-stories`**: Chia nhỏ PRD và Kiến trúc thành danh sách Epics và User Stories.
- **`bmad-check-implementation-readiness`**: Kiểm tra xem dự án đã đủ điều kiện để bắt đầu lập trình chưa.
- **Các agent hỗ trợ**:
  - `bmad-agent-architect` (Winston - Kiến trúc sư hệ thống).

### Giai đoạn 4: Thực Thi & Kiểm Thử (Implementation)
Lập trình, kiểm thử và bàn giao sản phẩm.
- **`bmad-sprint-planning`**: Lên kế hoạch sprint chạy dự án.
- **`bmad-dev-story`**: Thực hiện code từng story cụ thể theo đúng thiết kế kiến trúc.
- **`bmad-quick-dev`**: Lập trình nhanh, sửa lỗi hoặc tinh chỉnh tính năng.
- **`bmad-code-review`**: Đánh giá và kiểm duyệt chất lượng mã nguồn.
- **Các agent hỗ trợ**:
  - `bmad-agent-dev` (Amelia - Lập trình viên cao cấp).

---

## 3. Các Skill Tiện Ích Cực Kỳ Hữu Dụng

- **`bmad-help` (Khuyên dùng đầu tiên)**: Phân tích trạng thái hiện tại của dự án và gợi ý việc bạn cần làm tiếp theo.
- **`bmad-party-mode` (Thảo luận nhóm)**: Cho phép bạn mời nhiều agent AI (PM, Architect, Developer) vào cùng một phòng chat để tranh biện và đưa ra giải pháp toàn diện nhất.
- **`bmad-spec`**: Chuyển đổi một yêu cầu ngắn gọn của bạn thành một bản đặc tả kỹ thuật chi tiết.
- **`bmad-brainstorming`**: Hỗ trợ bạn lên ý tưởng, brainstorm tính năng mới.

---

## 4. Gợi Ý Câu Lệnh Mẫu (Prompt Templates)

Dưới đây là một số câu lệnh bạn có thể copy-paste vào chat để bắt đầu:

> 💡 **Khởi động dự án:**
> *"Hãy chạy skill `bmad-help` để phân tích dự án hiện tại của tôi và hướng dẫn tôi nên làm gì tiếp theo."*

> 💡 **Thảo luận nhóm về thiết kế:**
> *"Chạy `bmad-party-mode` và mời John (PM) cùng Winston (Architect) vào họp để thảo luận về cách tối ưu cấu trúc SEO HTML5 cho file mvp.html này."*

> 💡 **Tạo tài liệu PRD:**
> *"Sử dụng `bmad-prd` để viết một tài liệu yêu cầu sản phẩm chi tiết cho các chức năng tiếp theo."*

> 💡 **Viết Code:**
> *"Tôi muốn thêm tính năng [tên tính năng]. Hãy dùng `bmad-quick-dev` để triển khai code tuân thủ theo các quy tắc semantic HTML5 trong AGENTS.md."*
