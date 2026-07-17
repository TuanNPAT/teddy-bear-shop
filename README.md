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

Default accounts:
- admin@gmail.com / admin
- staff@gmail.com / staff
- customer@gmail.com / customer

Swagger with current context path:
- http://localhost:8080/teddy-shop/swagger-ui.html