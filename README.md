# Teddy Bear Shop - JWT Base Project

Project base for a simple teddy bear shop.

Current implemented scope:
- JWT authentication
- Register/Login
- ApiResponse
- ErrorCode + GlobalExceptionHandler
- Role: ADMIN, STAFF, CUSTOMER
- Seed accounts in ApplicationInitConfig
- Basic entities for UML: User, Category, Product, Order, OrderItem

Not implemented yet:
- Category controller/service/repository
- Product controller/service/repository
- Session cart
- Order controller/service/repository

## Tài khoản kiểm thử (Testing Accounts)

Dưới đây là danh sách tài khoản dùng để kiểm thử ứng dụng theo từng vai trò (Role):

| Vai trò (Role) | Email | Mật khẩu (Password) | Quyền hạn |
| --- | --- | --- | --- |
| **Admin** | `admin@gmail.com` | `admin` | Full Access (Dashboard, Category, Product, Order, Staff) |
| **Staff** | `staff@gmail.com` | `staff` | Order Management Only |
| **Customer** | `customer@gmail.com` | `customer` | Client Front-store (Cart, Checkout, Order History) |

Swagger API Documentation:
- http://localhost:8080/teddy-bear-shop/swagger-ui/index.html (Context Path: `/teddy-bear-shop`)