# TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS) - HỆ THỐNG TEDDY SHOP

## 1. TỔNG QUAN HỆ THỐNG
Tài liệu này mô tả chi tiết yêu cầu phần mềm (Software Requirements Specification) cho hệ thống cửa hàng bán thú bông Teddy Shop. Hệ thống bao gồm một ứng dụng Web (Web App) cho phép khách hàng mua sắm và quản trị viên/nhân viên quản lý cửa hàng, đơn hàng, và sản phẩm.

## 2. PHÂN LUỒNG TÁC VỤ THEO ACTORS (USE CASES)
Hệ thống định nghĩa 4 nhóm người dùng chính, bao gồm 3 Actor có tài khoản trong cơ sở dữ liệu và 1 Actor ngầm định.

### 2.1. Guest (Khách vãng lai - Chưa đăng nhập)
* **Xem sản phẩm:** Lướt xem danh sách các danh mục gấu bông (Category), xem chi tiết sản phẩm (Product) bao gồm giá, mô tả, hình ảnh, số lượng tồn.
* **Tìm kiếm & Lọc:** Tìm thú bông theo tên hoặc lọc theo danh mục.
* **Giỏ hàng (Cart):** Thêm sản phẩm vào giỏ hàng (lưu trữ tạm thời ở Local Storage/Session của trình duyệt).
* **Xác thực:** Đăng ký tài khoản mới (tạo record ở Account và Customer) hoặc Đăng nhập vào hệ thống.

### 2.2. Customer (Khách hàng - Đã đăng nhập)
*Kế thừa toàn bộ quyền hạn của Guest.*
* **Quản lý tài khoản cá nhân:** Cập nhật thông tin (Họ tên, Số điện thoại, Địa chỉ giao hàng mặc định).
* **Đặt hàng (Checkout):** Chuyển đổi giỏ hàng hiện tại thành Đơn hàng thực tế trong hệ thống (tạo Order và Order_Detail).
* **Thanh toán:** Lựa chọn phương thức thanh toán (COD hoặc Online) và ghi nhận giao dịch (Payment).
* **Lịch sử đơn hàng:** Theo dõi danh sách đơn hàng đã mua và trạng thái xử lý (Status).
* **Hủy đơn hàng:** Cho phép thao tác hủy chỉ khi đơn hàng đang ở trạng thái Pending (Chờ xác nhận).

### 2.3. Staff (Nhân viên cửa hàng)
* **Xác thực:** Đăng nhập vào hệ thống quản trị (CMS/Admin Panel).
* **Quản lý đơn hàng:**
    * Xem danh sách tổng hợp tất cả đơn hàng trên hệ thống.
    * Xác nhận đơn hàng: Đổi trạng thái từ Pending sang Confirmed. Hệ thống tự động ghi nhận nhân viên nào đã xử lý đơn (ProcessedBy_StaffID).
    * Cập nhật tiến trình: Chuyển trạng thái sang Shipped (Đang giao), Delivered (Đã giao), hoặc Cancelled (Đã hủy).
    * Cập nhật thanh toán: Xác nhận thanh toán thành công (Completed) đối với các đơn giao hàng thu tiền hộ (COD).
* **Kiểm tra kho hàng:** Tra cứu thông tin, số lượng tồn kho (StockQuantity) của sản phẩm để hỗ trợ tư vấn khách hàng.

### 2.4. Admin (Quản trị viên)
*Kế thừa toàn bộ quyền hạn của Staff. Bổ sung các quyền quản trị cấp cao:*
* **Quản lý Danh mục (Category):** Thêm mới, chỉnh sửa tên, xóa danh mục sản phẩm (CRUD).
* **Quản lý Sản phẩm (Product):**
    * Thêm sản phẩm mới (Nhập tên, giá, hình ảnh, danh mục, số lượng tồn ban đầu).
    * Sửa đổi thông tin sản phẩm (Giá bán, mô tả, hình ảnh).
    * Điều chỉnh số lượng tồn kho theo thực tế.
* **Quản lý Nhân sự (Staff/Account):** Tạo tài khoản cho nhân viên mới (cấp Role = Staff), vô hiệu hóa tài khoản (IsActive = false) khi nhân viên nghỉ việc.
* **Báo cáo & Thống kê:** Xem Dashboard tổng quan về doanh thu, số lượng đơn hàng bán ra theo các mốc thời gian.

## 3. CÁC LUỒNG NGHIỆP VỤ CHÍNH (KEY WORKFLOWS)

### Luồng 1: Flow Đặt hàng & Thanh toán (Customer Checkout Flow)
Đây là luồng nghiệp vụ tạo ra dữ liệu cho các bảng Order, Order_Detail và Payment.
1. **Giỏ hàng:** Khách hàng (Customer) chọn thú bông và thêm vào giỏ. Frontend quản lý danh sách này.
2. **Checkout:** Khách hàng chọn "Thanh toán". Hệ thống kiểm tra trạng thái đăng nhập. Yêu cầu đăng nhập nếu là Guest.
3. **Xác nhận thông tin:** Hệ thống tự động điền địa chỉ, số điện thoại lấy từ hồ sơ (bảng Customer). Khách hàng có quyền thay đổi thông tin nhận hàng cho từng đơn cụ thể.
4. **Chọn phương thức thanh toán:** Chọn COD (Thanh toán khi nhận hàng) hoặc Thanh toán qua cổng Online.
5. **Submit Đơn hàng (Backend xử lý):**
    * Tạo 1 bản ghi mới trong bảng Order (OrderDate = Now(), Status = Pending).
    * Lặp qua giỏ hàng, tạo nhiều bản ghi tương ứng trong bảng Order_Detail (Ghi nhận ProductID, Quantity, và UnitPrice tại thời điểm đặt).
    * Tạo 1 bản ghi trong bảng Payment liên kết với Order (PaymentStatus = Pending).
6. **Trừ kho:** Backend tự động giảm StockQuantity trong bảng Product tương ứng với số lượng đã đặt.

### Luồng 2: Flow Xử lý Đơn hàng (Staff Order Fulfillment Flow)
1. **Tiếp nhận:** Nhân viên (Staff) vào CMS, xem danh sách "Đơn hàng mới" (Status = Pending).
2. **Kiểm tra kho:** Staff click vào chi tiết đơn, đối chiếu số lượng thực tế trong kho thực tế (hoặc dựa trên Database).
3. **Xác nhận:** Bấm "Xác nhận đơn". Backend đổi Order.Status = Confirmed và lưu ProcessedBy_StaffID bằng ID của nhân viên đang thao tác.
4. **Giao hàng:** Đóng gói xong, bàn giao cho đơn vị vận chuyển -> Staff chuyển trạng thái thành Shipped.
5. **Hoàn tất:** Khách nhận được hàng -> Đổi trạng thái thành Delivered. Đổi trạng thái thanh toán (Payment) thành Completed (đối với đơn COD).

### Luồng 3: Flow Quản lý Kho hàng & Sản phẩm (Admin Catalog Flow)
1. **Tạo danh mục:** Admin truy cập mục "Quản lý Danh mục", tạo mới (Ví dụ: Gấu Teddy cao cấp) -> Lưu vào bảng Category.
2. **Thêm sản phẩm:** Admin vào "Quản lý Sản phẩm", bấm thêm mới.
3. **Nhập dữ liệu:** Điền Tên sản phẩm, Giá bán, upload Hình ảnh, chọn Danh mục từ danh sách, và nhập Số lượng tồn kho ban đầu.
4. **Công bố:** Bấm Lưu -> Dữ liệu được tạo trong bảng Product. Web app phía Customer lập tức được cập nhật để hiển thị sản phẩm mới này ở trang chủ.

---

# DANH SÁCH USER STORIES - HỆ THỐNG TEDDY SHOP

## Epic 1: Guest (Khách vãng lai)
**Mục tiêu:** Thu hút người dùng, cho phép họ dễ dàng tìm kiếm và xem thú bông trước khi quyết định mua.

* **US 1.1: Xem danh sách sản phẩm**
    * **Story:** Với tư cách là một Khách vãng lai, tôi muốn xem danh sách các thú bông mới nhất trên trang chủ để biết cửa hàng đang bán những gì.
    * **Acceptance Criteria (AC):**
        * Hiển thị danh sách sản phẩm theo dạng lưới (grid).
        * Mỗi thẻ sản phẩm hiển thị: Hình ảnh (ImageURL), Tên (Name), và Giá (Price).
        * Nếu StockQuantity = 0, hiển thị nhãn "Hết hàng" và làm mờ nút thêm vào giỏ.
* **US 1.2: Tìm kiếm và Lọc**
    * **Story:** Với tư cách là một Khách vãng lai, tôi muốn tìm kiếm thú bông theo tên hoặc lọc theo danh mục (Category) để nhanh chóng tìm được mẫu gấu tôi thích.
    * **AC:**
        * Có thanh tìm kiếm (Search bar) hoạt động theo từ khóa nhập vào (tìm theo chuỗi tương đối).
        * Có danh sách dropdown hoặc menu sidebar để chọn lọc theo Danh mục.
        * Kết quả hiển thị chính xác các sản phẩm thỏa mãn điều kiện lọc.
* **US 1.3: Thêm vào giỏ hàng**
    * **Story:** Với tư cách là một Khách vãng lai, tôi muốn thêm một sản phẩm vào giỏ hàng để lưu trữ tạm thời trước khi thanh toán.
    * **AC:**
        * Nút "Thêm vào giỏ" hiển thị ở cả trang danh sách và trang chi tiết sản phẩm.
        * Khi bấm thêm, có thông báo (toast/popup) "Đã thêm thành công".
        * Số lượng (badge) trên biểu tượng giỏ hàng ở header tăng lên tương ứng.
        * Dữ liệu giỏ hàng được lưu trữ ở Local Storage hoặc Session (không mất đi khi F5 trang).
* **US 1.4: Đăng ký tài khoản**
    * **Story:** Với tư cách là một Khách vãng lai, tôi muốn tạo tài khoản bằng Email và Mật khẩu để có thể đặt hàng và theo dõi tiến độ giao hàng.
    * **AC:**
        * Form đăng ký yêu cầu: Họ tên, Email, Mật khẩu, Số điện thoại.
        * Hệ thống kiểm tra Email không được trùng lặp trong bảng Account. Hiển thị lỗi nếu trùng.
        * Mật khẩu phải được mã hóa (PasswordHash) trước khi lưu xuống Database.
        * Tạo đồng thời dữ liệu ở bảng Account (với Role = Customer) và bảng Customer.

## Epic 2: Customer (Khách hàng đã đăng nhập)
**Mục tiêu:** Đảm bảo trải nghiệm mua sắm mượt mà, tiện lợi và an toàn.

* **US 2.1: Quản lý thông tin giao hàng**
    * **Story:** Với tư cách là một Khách hàng, tôi muốn cập nhật địa chỉ giao hàng và số điện thoại mặc định để không phải nhập lại nhiều lần khi mua sắm.
    * **AC:**
        * Có trang "Hồ sơ của tôi" hiển thị thông tin lấy từ bảng Customer.
        * Cho phép chỉnh sửa các trường FullName, PhoneNumber và ShippingAddress.
        * Bấm "Lưu" sẽ cập nhật dữ liệu thành công vào cơ sở dữ liệu.
* **US 2.2: Thanh toán đơn hàng (Checkout)**
    * **Story:** Với tư cách là một Khách hàng, tôi muốn tiến hành thanh toán các thú bông trong giỏ hàng để hoàn tất việc mua sắm.
    * **AC:**
        * Hệ thống yêu cầu đăng nhập nếu người dùng đang là Guest.
        * Hiển thị tóm tắt đơn hàng (danh sách món, tổng tiền).
        * Cho phép chọn Phương thức thanh toán (PaymentMethod: COD hoặc Online).
        * Sau khi đặt thành công, giỏ hàng (Local Storage) bị xóa, sinh ra một OrderID mới và hiển thị màn hình "Cảm ơn".
* **US 2.3: Xem lịch sử đơn hàng**
    * **Story:** Với tư cách là một Khách hàng, tôi muốn xem danh sách các đơn hàng tôi đã đặt và trạng thái của chúng để biết khi nào gấu bông được giao tới.
    * **AC:**
        * Hiển thị danh sách các đơn hàng thuộc về CustomerID của người dùng.
        * Hiển thị rõ trạng thái (Status): Pending, Confirmed, Shipped, Delivered, Cancelled.
        * Cho phép click vào từng đơn để xem chi tiết các món (Order_Detail).
* **US 2.4: Hủy đơn hàng**
    * **Story:** Với tư cách là một Khách hàng, tôi muốn hủy đơn hàng vừa đặt nếu tôi đổi ý hoặc phát hiện đặt nhầm.
    * **AC:**
        * Nút "Hủy đơn" chỉ hiển thị khi Order.Status = Pending.
        * Khi xác nhận hủy, trạng thái chuyển sang Cancelled, hệ thống tự động hoàn lại StockQuantity vào bảng Product.

## Epic 3: Staff (Nhân viên cửa hàng)
**Mục tiêu:** Xử lý đơn hàng nhanh chóng và hỗ trợ vận hành cửa hàng.

* **US 3.1: Quản lý danh sách đơn hàng mới**
    * **Story:** Với tư cách là Nhân viên, tôi muốn xem một danh sách các đơn hàng mới (Pending) để bắt đầu quy trình gọi điện xác nhận và đóng gói.
    * **AC:**
        * Đăng nhập thành công vào trang Admin CMS.
        * Có bộ lọc để chỉ hiển thị các đơn hàng đang chờ xử lý (Pending).
        * Bảng hiển thị: Mã đơn, Tên khách, Tổng tiền, Ngày đặt, Trạng thái.
* **US 3.2: Xác nhận và cập nhật tiến độ giao hàng**
    * **Story:** Với tư cách là Nhân viên, tôi muốn chuyển trạng thái đơn hàng (từ Chờ xác nhận -> Đang giao -> Đã giao) để hệ thống ghi nhận và khách hàng nắm được tiến độ.
    * **AC:**
        * Khi nhân viên đổi trạng thái sang Confirmed, hệ thống lưu ID của nhân viên đó vào trường ProcessedBy_StaffID.
        * Chỉ được phép đổi trạng thái theo luồng tuyến tính: Pending -> Confirmed -> Shipped -> Delivered.
        * Nếu đơn vị giao hàng báo khách không nhận hàng, được quyền đổi trạng thái sang Cancelled.
        * Khi đơn hàng chuyển sang Delivered đối với hình thức COD, trạng thái của Payment tự động chuyển sang Completed.

## Epic 4: Admin (Quản trị viên)
**Mục tiêu:** Kiểm soát toàn bộ hệ thống, kho hàng, nhân sự và theo dõi tình hình kinh doanh.

* **US 4.1: Quản lý Sản phẩm (Catalog Management)**
    * **Story:** Với tư cách là Admin, tôi muốn thêm mới, sửa đổi hoặc xóa các mẫu thú bông để danh mục sản phẩm luôn được cập nhật thực tế.
    * **AC:**
        * Có form nhập thông tin sản phẩm (Name, CategoryID, Price, StockQuantity, ImageURL).
        * Cho phép dán link URL ảnh sản phẩm.
        * Chỉ được xóa (Delete) sản phẩm nếu sản phẩm đó chưa từng phát sinh đơn hàng. Nếu đã có đơn, chỉ cho phép ẩn đi (set IsActive = false hoặc chuyển Stock = 0).
* **US 4.2: Quản lý Danh mục (Categories)**
    * **Story:** Với tư cách là Admin, tôi muốn tạo các danh mục mới (ví dụ: "Gấu Teddy size to", "Gấu Lotso") để phân loại sản phẩm tốt hơn, giúp khách dễ tìm kiếm.
    * **AC:**
        * Có thể thực hiện đủ thao tác CRUD (Thêm, Đọc, Sửa, Xóa) trong bảng Category.
        * Nếu xóa danh mục đang chứa sản phẩm bên trong, hệ thống phải hiện popup cảnh báo và chặn thao tác xóa.
* **US 4.3: Quản lý Nhân sự**
    * **Story:** Với tư cách là Admin, tôi muốn tạo tài khoản cho nhân viên mới và cấp quyền truy cập vào hệ thống nội bộ, hoặc khóa tài khoản khi họ nghỉ việc.
    * **AC:**
        * Tạo được bản ghi vào bảng Account với Role = Staff, và nhập thông tin nhân sự vào bảng Staff.
        * Có nút "Khóa tài khoản" (set IsActive = false). Tài khoản bị khóa sẽ không thể login vào CMS.
* **US 4.4: Báo cáo & Thống kê (Dashboard)**
    * **Story:** Với tư cách là Admin, tôi muốn xem bảng điều khiển tổng hợp thống kê doanh thu và số lượng đơn hàng để đánh giá hiệu quả kinh doanh của shop.
    * **AC:**
        * Hiển thị Widget tổng doanh thu (TotalAmount) trong khoảng thời gian tùy chọn (ngày/tuần/tháng). Chỉ cộng gộp các đơn có Order.Status = Delivered.
        * Hiển thị danh sách Top 5 sản phẩm bán chạy nhất dựa trên tổng Quantity từ bảng Order_Detail.

---

# BẢNG PHÂN RÃ CÔNG VIỆC (WORK BREAKDOWN STRUCTURE) - TEDDY SHOP
Dựa trên thiết kế ERD, tài liệu SRS và User Stories, dưới đây là danh sách phân rã công việc chi tiết (Breakdown Task List) dành cho đội ngũ phát triển (Frontend, Backend, Database).

## 1. Giai đoạn Khởi tạo & Cơ sở dữ liệu (Database/DevOps)
| Mã Task | Hạng mục | Chi tiết công việc | Phân loại |
|---|---|---|---|
| DB-01 | Database Design | Thiết lập cấu trúc Database theo ERD (Tạo các bảng Account, Customer, Staff, Category, Product, Order, Order_Detail, Payment). | DBA / Backend |
| DB-02 | Project Setup | Khởi tạo source code cho Frontend (React/Vue/Angular) và Backend (NodeJS/Java/C#). | FE & BE |
| DB-03 | Mock Data | Tạo dữ liệu mẫu (Seeder) cho Category, Product, Admin Account để test hiển thị. | Backend |

## 2. Giai đoạn Backend (Phát triển RESTful APIs)
| Mã Task | Hạng mục | Chi tiết công việc | Phân loại |
|---|---|---|---|
| BE-01 | Authentication | Viết API Đăng ký, Đăng nhập và mã hóa mật khẩu. Phân quyền JWT (Role: Admin/Staff/Customer). | Backend |
| BE-02 | Catalog API | Viết API CRUD cho Category và Product (Hỗ trợ upload ảnh/nhận URL ảnh). | Backend |
| BE-03 | Customer Profile | Viết API lấy thông tin và cập nhật hồ sơ khách hàng (Customer). | Backend |
| BE-04 | Checkout API | Viết API tiếp nhận dữ liệu Giỏ hàng, tạo record trong Order, Order_Detail và Payment. Trừ số lượng tồn kho (StockQuantity). | Backend |
| BE-05 | Order API (Client) | Viết API lấy danh sách đơn hàng của Customer đang đăng nhập và API Hủy đơn (nếu Pending). | Backend |
| BE-06 | Order API (Admin) | Viết API cho Staff/Admin lấy toàn bộ danh sách đơn hàng, API cập nhật trạng thái đơn hàng (ProcessedBy_StaffID). | Backend |
| BE-07 | Staff API | Viết API tạo mới, lấy danh sách và khóa (Deactivate) tài khoản Staff. | Backend |
| BE-08 | Dashboard API | Viết API thống kê tổng doanh thu theo thời gian và Top 5 sản phẩm bán chạy nhất. | Backend |

## 3. Giai đoạn Frontend (Web Khách hàng - Client Side)
| Mã Task | Hạng mục | Chi tiết công việc | Phân loại |
|---|---|---|---|
| FE-C01 | Layout & Routing | Dựng Layout chung (Header, Footer, Navigation) và cấu hình Router cơ bản. | Frontend |
| FE-C02 | Home & Products | Trang chủ: Gắn API hiển thị danh sách sản phẩm, nhãn "Hết hàng". | Frontend |
| FE-C03 | Search & Filter | Thực hiện chức năng tìm kiếm sản phẩm theo tên và lọc theo danh mục. | Frontend |
| FE-C04 | Cart Management | Xử lý logic Giỏ hàng (Thêm/Xóa/Sửa số lượng) lưu vào Local Storage. Hiển thị badge số lượng. | Frontend |
| FE-C05 | Auth Pages | Dựng UI và ghép API form Đăng nhập / Đăng ký. Xử lý lưu Token. | Frontend |
| FE-C06 | Profile Page | Trang Hồ sơ: Form hiển thị và cập nhật thông tin cá nhân, địa chỉ giao hàng. | Frontend |
| FE-C07 | Checkout Flow | Trang Thanh toán: Lấy dữ liệu Giỏ hàng, form chọn phương thức thanh toán, gọi API đặt hàng, hiển thị trang Cảm ơn. | Frontend |
| FE-C08 | Order History | Trang Lịch sử đơn hàng: Hiển thị danh sách, trạng thái đơn, tính năng "Hủy đơn". | Frontend |

## 4. Giai đoạn Frontend (Web Quản trị - CMS / Admin Panel)
| Mã Task | Hạng mục | Chi tiết công việc | Phân loại |
|---|---|---|---|
| FE-A01 | Admin Layout | Dựng màn hình Đăng nhập Admin và Layout chính của CMS (Sidebar, Header, Breadcrumbs). | Frontend |
| FE-A02 | Dashboard | Hiển thị biểu đồ thống kê doanh thu và bảng xếp hạng sản phẩm bán chạy. | Frontend |
| FE-A03 | Category Mgt | Màn hình Quản lý Danh mục: Bảng danh sách, Modal Thêm/Sửa/Xóa. | Frontend |
| FE-A04 | Product Mgt | Màn hình Quản lý Sản phẩm: Bảng danh sách (có phân trang/lọc), Form Thêm/Sửa sản phẩm. | Frontend |
| FE-A05 | Order Mgt | Màn hình Quản lý Đơn hàng: Bảng danh sách đơn hàng, Modal xem chi tiết, tính năng Cập nhật trạng thái đơn. | Frontend |
| FE-A06 | Staff Mgt | Màn hình Quản lý Nhân sự: Bảng danh sách nhân viên, tạo tài khoản mới, toggle khóa tài khoản. | Frontend |