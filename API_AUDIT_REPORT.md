# Báo cáo Kiểm toán và Đối chiếu API (API Audit Report) - Teddy Shop

Hồ sơ này báo cáo kết quả rà soát toàn diện (audit) sự khớp nối giữa các API thực tế ở phía Backend (mã nguồn Java Spring Boot) và các lệnh gọi API cũng như luồng dữ liệu ở phía Frontend (mã nguồn React TypeScript).

---

## 1. Kiểm kê toàn bộ API thực tế ở Backend (Bước 1)

Dưới đây là danh sách toàn bộ các API thực tế được định nghĩa trong các RestController ở Backend:

### 1.1. AuthController (`/api/auth`)
*   `POST /api/auth/register/send-otp`
    *   **Mục đích:** Gửi mã OTP đăng ký tài khoản qua email.
    *   **Quyền truy cập:** Public (Khách vãng lai).
    *   **Request DTO:** `OTPRequest` (chứa `email`).
    *   **Response DTO:** `ApiResponse<String>`.
*   `POST /api/auth/register/verify`
    *   **Mục đích:** Xác thực mã OTP và đăng ký tài khoản khách hàng mới.
    *   **Quyền truy cập:** Public.
    *   **Request DTO:** `RegisterRequest` (chứa `fullName`, `email`, `password`) kèm RequestParam `otp`.
    *   **Response DTO:** `ApiResponse<UserResponse>`.
*   `POST /api/auth/login`
    *   **Mục đích:** Đăng nhập hệ thống bằng email và mật khẩu, cấp JWT token.
    *   **Quyền truy cập:** Public.
    *   **Request DTO:** `LoginRequest` (chứa `email`, `password`).
    *   **Response DTO:** `ApiResponse<AuthResponse>` (chứa `token`, `tokenType`, `email`, `role`).
*   `POST /api/auth/forgot-password/send-otp`
    *   **Mục đích:** Gửi mã OTP yêu cầu đặt lại mật khẩu.
    *   **Quyền truy cập:** Public.
    *   **Request DTO:** `OTPRequest`.
    *   **Response DTO:** `ApiResponse<String>`.
*   `POST /api/auth/forgot-password/reset`
    *   **Mục đích:** Đặt lại mật khẩu mới sau khi xác thực OTP thành công (không trả về token).
    *   **Quyền truy cập:** Public.
    *   **Request DTO:** `ResetPasswordRequest` (chứa `email`, `otp`, `newPassword`).
    *   **Response DTO:** `ApiResponse<String>`.
*   `POST /api/auth/forgot-password/reset-and-login`
    *   **Mục đích:** Đặt lại mật khẩu mới và trả về luôn token đăng nhập.
    *   **Quyền truy cập:** Public.
    *   **Request DTO:** `ResetPasswordRequest`.
    *   **Response DTO:** `ApiResponse<AuthResponse>`.

### 1.2. UserController (`/api/v1/users`)
*   `GET /api/v1/users/me`
    *   **Mục đích:** Lấy thông tin tài khoản cá hiện tại.
    *   **Quyền truy cập:** Đăng nhập bất kỳ (Customer, Staff, Admin).
    *   **Request DTO:** Không.
    *   **Response DTO:** `ApiResponse<UserResponse>`.
*   `PATCH /api/v1/users/me`
    *   **Mục đích:** Cập nhật thông tin tài khoản cá nhân.
    *   **Quyền truy cập:** Đăng nhập bất kỳ.
    *   **Request DTO:** `UpdateProfileRequest` (chứa `fullName`, `phone`, `address`).
    *   **Response DTO:** `ApiResponse<UserResponse>`.
*   `GET /api/v1/users`
    *   **Mục đích:** Phân trang, tìm kiếm và lọc danh sách tài khoản người dùng trên toàn hệ thống.
    *   **Quyền truy cập:** Vai trò **ADMIN** (kiểm tra phân quyền ở service).
    *   **Request Params:** `page`, `size`, `sortBy`, `direction`, `keyword`, `role`, `status`.
    *   **Response DTO:** `ApiResponse<Page<UserResponse>>`.
*   `GET /api/v1/users/{id}`
    *   **Mục đích:** Lấy chi tiết tài khoản người dùng theo ID.
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request DTO:** Không.
    *   **Response DTO:** `ApiResponse<UserResponse>`.
*   `PATCH /api/v1/users/{id}/status`
    *   **Mục đích:** Bật/Khóa hoạt động của tài khoản người dùng theo ID (không cho phép tự khóa mình, không cho khóa Admin cuối).
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request Params:** `status` (Boolean).
    *   **Response DTO:** `ApiResponse<UserResponse>`.
*   `PATCH /api/v1/users/{id}/role`
    *   **Mục đích:** Cập nhật vai trò (Role) của người dùng (không cho tự đổi của mình, không cho hạ cấp Admin cuối).
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request Params:** `role` (ADMIN/STAFF/CUSTOMER).
    *   **Response DTO:** `ApiResponse<UserResponse>`.
*   `PATCH /api/v1/users/{id}/password-reset`
    *   **Mục đích:** Đặt lại mật khẩu người dùng về giá trị mặc định (`Password@123`).
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request DTO:** Không.
    *   **Response DTO:** `ApiResponse<Void>`.

### 1.3. ProductController (`/api/v1/products`)
*   `POST /api/v1/products`
    *   **Mục đích:** Tạo mới sản phẩm kèm theo tải ảnh lên (Multipart file upload).
    *   **Quyền truy cập:** Vai trò **ADMIN** (thông qua phân quyền).
    *   **Request DTO:** `@ModelAttribute ProductCreationRequest` (gồm `name`, `code`, `description`, `price`, `stock`, `category`, `files`).
    *   **Response DTO:** `ResponseEntity<ProductResponse>`.
*   `PUT /api/v1/products/{productId}/info`
    *   **Mục đích:** Cập nhật thông tin văn bản cơ bản của sản phẩm (không bao gồm hình ảnh).
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request DTO:** `ProductUpdateInfoRequest` (gồm `name`, `description`, `price`, `stock`, `category`, `status`).
    *   **Response DTO:** `ApiResponse<ProductResponse>`.
*   `POST /api/v1/products/{productId}/images`
    *   **Mục đích:** Tải ảnh bổ sung thêm vào sản phẩm sẵn có.
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request Params:** `files` (Danh sách MultipartFile).
    *   **Response DTO:** `ApiResponse<ProductResponse>`.
*   `DELETE /api/v1/products/{productId}/images`
    *   **Mục đích:** Xóa danh sách các ảnh khỏi sản phẩm dựa theo đường dẫn URL.
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request DTO:** `List<String>` (Danh sách hình ảnh cần xóa).
    *   **Response DTO:** `ApiResponse<ProductResponse>`.
*   `GET /api/v1/products`
    *   **Mục đích:** Lấy danh sách sản phẩm có phân trang, lọc và tìm kiếm.
    *   **Quyền truy cập:** Public.
    *   **Request Params:** `ProductSearchRequest` (gồm `page`, `size`, `search`, `category`, `status`, `sort`).
    *   **Response DTO:** `ApiResponse<ProductPageResponse>`.
*   `GET /api/v1/products/{productId}`
    *   **Mục đích:** Xem chi tiết một sản phẩm theo ID.
    *   **Quyền truy cập:** Public.
    *   **Request DTO:** Không.
    *   **Response DTO:** `ApiResponse<ProductResponse>`.
*   `DELETE /api/v1/products/{productId}`
    *   **Mục đích:** Xóa mềm sản phẩm (thiết lập sang trạng thái không hiển thị nhưng giữ nguyên dòng lịch sử).
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request DTO:** Không.
    *   **Response DTO:** `ResponseEntity<Void>`.
*   `PATCH /api/v1/products/{productId}/restore`
    *   **Mục đích:** Khôi phục lại sản phẩm đã bị xóa mềm trước đó.
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request DTO:** Không.
    *   **Response DTO:** `ApiResponse<ProductResponse>`.
*   `GET /api/v1/products/deleted`
    *   **Mục đích:** Danh sách các sản phẩm đang nằm trong "Thùng rác" (đã bị xóa mềm).
    *   **Quyền truy cập:** Vai trò **ADMIN**.
    *   **Request DTO:** Không.
    *   **Response DTO:** `ApiResponse<List<ProductResponse>>`.

### 1.4. OrderController (`/api/v1/orders`)
*   `POST /api/v1/orders`
    *   **Mục đích:** Tạo đơn đặt hàng mới và giảm tồn kho.
    *   **Quyền truy cập:** Vai trò **CUSTOMER** (khách hàng đăng nhập).
    *   **Request DTO:** `OrderRequest` (gồm `customerName`, `customerPhone`, `shippingAddress`, `paymentMethod`, `note`, `items` là mảng `{productId, quantity}`).
    *   **Response DTO:** `ApiResponse<OrderResponse>`.
*   `GET /api/v1/orders/{orderId}`
    *   **Mục đích:** Lấy thông tin chi tiết một đơn hàng theo ID.
    *   **Quyền truy cập:** Đăng nhập bất kỳ (Customer chỉ được xem đơn của mình; Staff/Admin được xem tất cả).
    *   **Request DTO:** Không.
    *   **Response DTO:** `ApiResponse<OrderResponse>`.
*   `GET /api/v1/orders/me`
    *   **Mục đích:** Lấy danh sách các đơn hàng của khách hàng hiện tại.
    *   **Quyền truy cập:** Vai trò **CUSTOMER**.
    *   **Request DTO:** Không.
    *   **Response DTO:** `ApiResponse<List<OrderResponse>>`.
*   `GET /api/v1/orders`
    *   **Mục đích:** Quản lý xem toàn bộ đơn hàng có bộ lọc và phân trang.
    *   **Quyền truy cập:** Vai trò **STAFF** hoặc **ADMIN**.
    *   **Request Params:** `OrderFilterRequest` (gồm `page`, `size`, `sortBy`, `sortDirection`, `orderCode`, `status`, `customerName`, `customerPhone`, `fromDate`, `toDate`).
    *   **Response DTO:** `ApiResponse<Page<OrderResponse>>`.
*   `GET /api/v1/orders/status/{status}`
    *   **Mục đích:** Lấy danh sách đơn hàng theo một trạng thái cố định.
    *   **Quyền truy cập:** Vai trò **STAFF** hoặc **ADMIN**.
    *   **Request DTO:** `@PathVariable OrderStatus status`.
    *   **Response DTO:** `ApiResponse<List<OrderResponse>>`.
*   `PATCH /api/v1/orders/{orderId}/status`
    *   **Mục đích:** Cập nhật trạng thái xử lý đơn hàng theo luồng tuyến tính.
    *   **Quyền truy cập:** Vai trò **STAFF** hoặc **ADMIN**.
    *   **Request Params:** `status` (OrderStatus).
    *   **Response DTO:** `ApiResponse<OrderResponse>`.
*   `PATCH /api/v1/orders/{orderId}/cancel`
    *   **Mục đích:** Hủy đơn hàng và tự động hoàn trả tồn kho.
    *   **Quyền truy cập:** Customer (chỉ được hủy đơn Pending), Staff/Admin (được hủy ở bất cứ trạng thái nào trước khi giao).
    *   **Request Params:** `reason` (Lý do hủy).
    *   **Response DTO:** `ApiResponse<Void>`.

### 1.5. PaymentController (`/api/v1/payments`)
*   `POST /api/v1/payments/create`
    *   **Mục đích:** Tạo yêu cầu thanh toán qua VNPay và nhận URL liên kết thanh toán.
    *   **Quyền truy cập:** Đăng nhập bất kỳ (Customer).
    *   **Request DTO:** `PaymentRequest` (chứa `orderId`).
    *   **Response DTO:** `ApiResponse<PaymentResponse>` (chứa `paymentId`, `payUrl`).
*   `GET /api/v1/payments/vnpay-return`
    *   **Mục đích:** Xử lý kết quả trả về từ VNPay (IPN/Callback), xác thực chữ ký và cập nhật trạng thái đơn hàng sang `PAID`.
    *   **Quyền truy cập:** Public.
    *   **Request Params:** Truyền đầy đủ các tham số từ VNPay trả về.
    *   **Response DTO:** `ApiResponse<PaymentResultResponse>`.
*   `GET /api/v1/payments/order/{orderId}`
    *   **Mục đích:** Tra cứu thông tin thanh toán của một đơn hàng cụ thể.
    *   **Quyền truy cập:** Đăng nhập bất kỳ.
    *   **Response DTO:** `ApiResponse<PaymentResponse>`.

---

## 2. Kiểm kê toàn bộ API mà FE đang gọi thật (Bước 2)

Dưới đây là danh sách các API call thật phía Frontend đang thực hiện thông qua Axios instances (`api` & `authApi`):

| API Endpoint Gọi Từ FE | Axios Method | File FE xử lý | Trang/Component sử dụng |
|---|---|---|---|
| `/auth/login` | POST | `authApi.ts` | `LoginPage.tsx` |
| `/auth/register/send-otp` | POST | `authApi.ts` | `RegisterPage.tsx` |
| `/auth/register/verify` | POST | `authApi.ts` | `RegisterPage.tsx` |
| `/users/me` | GET | `userApi.ts` | `ProfilePage.tsx`, `CheckoutPage.tsx` |
| `/users/me` | PATCH | `userApi.ts` | `ProfilePage.tsx` |
| `/products` | GET | `productApi.ts` | `HomePage.tsx`, `ProductDetailPage.tsx` |
| `/products/{id}` | GET | `productApi.ts` | `ProductDetailPage.tsx` |
| `/products` | POST (Multipart) | Gọi trực tiếp | `AdminProducts.tsx` |
| `/products/{id}/info` | PUT | Gọi trực tiếp | `AdminProducts.tsx` |
| `/products/{id}/images` | POST (Multipart) | Gọi trực tiếp | `AdminProducts.tsx` |
| `/products/{id}` | DELETE | Gọi trực tiếp | `AdminProducts.tsx` |
| `/products/{id}/restore` | PATCH | Gọi trực tiếp | `AdminProducts.tsx` |
| `/products/deleted` | GET | Gọi trực tiếp | `AdminProducts.tsx` |
| `/orders` | POST | `orderApi.ts` | `CheckoutPage.tsx` |
| `/orders/me` | GET | `orderApi.ts` | `OrderHistoryPage.tsx` |
| `/orders/{id}/cancel` | PATCH | `orderApi.ts` | `OrderHistoryPage.tsx`, `AdminOrders.tsx` |
| `/orders` | GET | `orderApi.ts` | `AdminOrders.tsx`, `cmsMockApi.ts` (dashboard) |
| `/orders/{id}` | GET | `orderApi.ts` | `AdminOrders.tsx` |
| `/orders/{id}/status` | PATCH | `orderApi.ts` | `AdminOrders.tsx` |

---

## 3. Kiểm kê các chức năng FE đang MOCK/TODO (Bước 3)

Rà soát toàn bộ mã nguồn FE, có 3 hạng mục lớn đang dùng dữ liệu giả lập (`localStorage` / tính toán thủ công ở Client):

### 3.1. Danh mục (Category CRUD)
*   **Tệp tin:** `FE/src/pages/admin/AdminCategories.tsx`, `FE/src/pages/admin/AdminProducts.tsx`, `FE/src/pages/HomePage.tsx`.
*   **Trạng thái mock:** Gọi thông qua `cmsMockApi.getCategories()` và `cmsMockApi.updateCategory()`. Dữ liệu lưu hoàn toàn tại `localStorage` với khóa `teddy-shop-cms-categories`.
*   **Lý do:** Backend hiện chưa có bảng lưu trữ danh mục riêng biệt và không có các controller/service phục vụ API CRUD Danh mục. Cột danh mục hiện là một chuỗi văn bản (String) map trực tiếp với Enum ở Backend.

### 3.2. Quản lý Nhân viên (Staff/User Management)
*   **Tệp tin:** `FE/src/pages/admin/AdminStaff.tsx`, `FE/src/components/admin/AdminGuard.tsx`, `FE/src/pages/LoginPage.tsx`.
*   **Trạng thái mock:** Gọi thông qua các hàm `cmsMockApi.getStaff()`, `createStaff()`, `toggleStaffStatus()` và `isStaffActive()`. Toàn bộ dữ liệu được lưu trong `localStorage` với khóa `teddy-shop-cms-staff`.
*   **Lý do:** Backend hiện chưa hỗ trợ API tạo nhanh tài khoản nhân viên (Staff) riêng biệt. Admin hiện tại không có công cụ tạo trực tiếp tài khoản nhân viên khác.

### 3.3. Trang Tổng quan (Admin Dashboard)
*   **Tệp tin:** `FE/src/pages/admin/AdminDashboard.tsx`.
*   **Trạng thái mock:** Gọi thông qua `cmsMockApi.getDashboardData()`. Hàm mock này thực tế **gọi API lấy toàn bộ đơn hàng** `/orders?size=1000`, sau đó viết thuật toán JavaScript ở phía Frontend để tính tổng doanh thu, đếm số đơn Pending, vẽ biểu đồ xu hướng theo ngày, và sắp xếp tìm Top 5 sản phẩm bán chạy nhất.
*   **Lý do:** Backend chưa cung cấp một API thống kê tổng quan (Dashboard) nào cho Admin. Việc tính toán phía Client trên tập đơn hàng lớn sẽ gây ra suy giảm hiệu năng nghiêm trọng (Performance bottleneck) khi số lượng đơn hàng tăng lên.

---

## 4. Phân loại và Đề xuất Hướng xử lý (Bước 4)

Sau khi đối chiếu danh sách API Backend định nghĩa và các chức năng của Frontend, chúng tôi phân loại thành các nhóm nhiệm vụ cụ thể:

### Nhóm A: Backend ĐÃ CÓ API, FE CHƯA tích hợp
*(Nhiệm vụ thuộc về Frontend - có thể tự thực hiện ngay lập tức)*

1.  **Quản lý người dùng thực tế bằng API:**
    *   **Endpoint Backend:**
        *   `GET /api/v1/users` (Phân trang, lọc và tìm kiếm user thật).
        *   `GET /api/v1/users/{id}` (Xem chi tiết user).
        *   `PATCH /api/v1/users/{id}/status` (Khóa/mở khóa tài khoản).
        *   `PATCH /api/v1/users/{id}/role` (Đổi quyền hạn người dùng).
        *   `PATCH /api/v1/users/{id}/password-reset` (Reset mật khẩu về mặc định).
    *   **Mục đích:** Frontend có thể viết thêm trang **Quản lý Tài khoản Hệ thống (User Management)** dành riêng cho Admin để quản lý danh sách toàn bộ người dùng thực tế trong database (bao gồm cả Customer, Staff, Admin).
2.  **Tích hợp thanh toán trực tuyến VNPay:**
    *   **Endpoint Backend:**
        *   `POST /api/v1/payments/create` (Tạo URL giao dịch).
        *   `GET /api/v1/payments/vnpay-return` (Xác thực callback giao dịch).
    *   **Mục đích:** Tại trang `CheckoutPage.tsx`, nếu khách chọn phương thức thanh toán là `VNPAY`, FE cần gọi API `/payments/create` để lấy link và chuyển hướng trình duyệt sang cổng thanh toán VNPay thay vì đặt hàng COD bình thường. Đồng thời tạo một trang `/payment-result` ở FE làm URL callback để nhận dữ liệu phản hồi từ VNPay và hiển thị kết quả cho khách hàng.

---

### Nhóm B: Frontend đang Mock vì Backend CHƯA có API
*(Nhiệm vụ cần gửi yêu cầu cho Backend triển khai)*

1.  **Dashboard / Báo cáo Thống kê:**
    *   **Vấn đề:** FE đang fetch 1000 đơn hàng về để tự tính toán doanh thu/biểu đồ.
    *   **Đề xuất API cho Backend:**
        *   Method: `GET`
        *   Path: `/api/v1/admin/dashboard/summary`
        *   Request Params: `fromDate`, `toDate` (để lọc theo khoảng thời gian tùy chọn).
        *   Response DTO mẫu:
            ```json
            {
              "code": 1000,
              "result": {
                "totalRevenue": 15750000.00,
                "totalOrders": 120,
                "pendingOrders": 14,
                "revenueTrend": [
                  { "date": "2026-07-01", "revenue": 1200000 },
                  { "date": "2026-07-02", "revenue": 850000 }
                ],
                "topProducts": [
                  { "productId": 1, "productName": "Gấu Teddy Cổ Điển", "quantitySold": 45, "imageUrl": "..." }
                ]
              }
            }
            ```
2.  **Quản lý tạo mới tài khoản Nhân viên (Staff Creation API):**
    *   **Vấn đề:** Admin muốn tạo trực tiếp tài khoản cho nhân viên cấp dưới từ trang CMS (AdminStaff.tsx). Hiện tại, backend chỉ có API tự đăng ký OTP của Customer. Admin chỉ có thể đổi vai trò (Role) của một tài khoản đã đăng ký từ trước chứ không thể chủ động tạo tài khoản mới.
    *   **Đề xuất API cho Backend:**
        *   Method: `POST`
        *   Path: `/api/v1/users/staff` (hoặc `/api/v1/admin/users/create`)
        *   Request DTO:
            ```json
            {
              "fullName": "Nguyễn Văn Staff 3",
              "email": "staff3@gmail.com",
              "password": "InitialSecurePassword123"
            }
            ```
        *   Response DTO: `ApiResponse<UserResponse>`
3.  **Bảng lưu trữ & API CRUD Danh mục sản phẩm (Category):**
    *   **Vấn đề:** Hiện tại chưa có thực thể Category trong database (chỉ là trường chuỗi cứng). FE đang phải lưu mô tả và tên tiếng Việt của danh mục vào localStorage.
    *   **Đề xuất API cho Backend:**
        *   Xây dựng bảng `categories` liên kết với bảng `products` (khóa ngoại `category_id`).
        *   API định nghĩa:
            *   `GET /api/v1/categories` (Lấy tất cả danh mục).
            *   `POST /api/v1/categories` (Tạo danh mục mới).
            *   `PUT /api/v1/categories/{id}` (Sửa thông tin danh mục).
            *   `DELETE /api/v1/categories/{id}` (Xóa danh mục - kiểm tra và chặn nếu danh mục có chứa sản phẩm).

---

### Nhóm C: API Backend thiếu trường dữ liệu Frontend cần
*(Yêu cầu tinh chỉnh nhỏ ở Backend)*

1.  **Form đăng ký tự động bổ sung số điện thoại:**
    *   **Vấn đề:** Trong `RegisterRequest.java` ở backend hiện tại không có trường `phone`. Khi khách hàng đăng ký ở FE, FE phải tự lưu trữ phone ở Client hoặc bỏ qua, khiến cho thông tin cá nhân lúc mới tạo tài khoản bị khuyết trường số điện thoại, bắt buộc khách hàng phải vào trang Profile để điền lại sau đó.
    *   **Đề xuất sửa đổi:** Thêm trường `private String phone` vào class `RegisterRequest` của backend và thực hiện gán trường này trong phương thức đăng ký.

---

## 5. Đối chiếu chi tiết với `requirements.md` (Bước 5)

Rà soát lại sự đáp ứng của các User Stories và Acceptance Criteria thuộc Epic 3 (Staff) và Epic 4 (Admin):

| Mã US | Mô tả User Story | Trạng thái hiện tại trên mã nguồn | Mức độ phụ thuộc API |
|---|---|---|---|
| **US 3.1** | Staff xem danh sách đơn hàng mới (Pending) | **Hoàn thành 100%**. UI đã gọi API lọc `/orders?status=PENDING` khi Staff đăng nhập. | Dùng API thật. |
| **US 3.2** | Staff duyệt đơn, chuyển trạng thái đơn hàng COD/VNPay | **Hoàn thành 100%**. Đã siết luồng tuyến tính trên FE để tránh đổi lùi trạng thái. Tự động xử lý trạng thái thanh toán. | Dùng API thật. |
| **US 4.1** | Admin quản lý Sản phẩm (Catalog Management) | **Hoàn thành 100%**. UI hỗ trợ đầy đủ thêm, sửa, xóa mềm, khôi phục sản phẩm và xem thùng rác. | Dùng API thật. |
| **US 4.2** | Admin quản lý Danh mục (Category CRUD) | **Mock một nửa (50%)**. Màn hình UI đã đầy đủ, kiểm tra logic chặn xóa danh mục chứa sản phẩm hoạt động tốt, nhưng dữ liệu chỉ ghi vào `localStorage`. | **Đang thiếu API Backend**. |
| **US 4.3** | Admin quản lý nhân sự (Staff Management) | **Mock một nửa (50%)**. Màn hình UI hỗ trợ tạo mới và khóa tài khoản, nhưng chỉ ghi nhận vào `localStorage`. | **Đang thiếu API tạo Staff**. |
| **US 4.4** | Báo cáo & Thống kê (Dashboard) | **Mock một nửa (50%)**. UI biểu đồ doanh thu và bảng xếp hạng hoạt động mượt mà nhưng do FE tự xử lý thuật toán tính toán từ toàn bộ đơn hàng lấy về. | **Đang thiếu API Dashboard**. |
