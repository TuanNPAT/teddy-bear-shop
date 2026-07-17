# TeddyBearShop - Backend AI Rules

# 1. Project Architecture

Project follows a layered architecture.

Controller
↓
Service
↓
Repository
↓
Database

DTO is used to communicate with Controller.

Entity(Model) is only used inside Service and Repository.

Mapper is responsible for converting between DTO and Entity.

Never expose Entity directly.

-------------------------------------------------------

# 2. Package Responsibility

common
Shared classes.

configuration
Security, Swagger, Bean Configuration.

controller
Receive HTTP request.
Validate request.
Call Service.
Return ApiResponse.

dto/request
Request DTO.

dto/response
Response DTO.

model
JPA Entity.

repository
Spring Data JPA Repository.

service
Business Logic.

mapper
Convert Entity ↔ DTO.

enums
Enum definitions.

-------------------------------------------------------

# 3. Request Flow

Client

↓

Controller

↓

Request DTO Validation

↓

Service

↓

Repository

↓

Database

↓

Entity

↓

Mapper

↓

Response DTO

↓

ApiResponse.success()

↓

Client

-------------------------------------------------------

# 4. Controller Rules

Controller MUST NOT contain business logic.

Controller responsibilities:

- Receive request
- Validate request
- Call Service
- Return ApiResponse

Example Flow

POST /categories

↓

CategoryController

↓

categoryService.create()

↓

return ApiResponse.success(...)

-------------------------------------------------------

# 5. Service Rules

Business logic belongs here.

Service may

- Validate business rules
- Check duplicate
- Check existence
- Call multiple repositories
- Throw AppException

Service NEVER returns Entity.

Service always returns Response DTO.

-------------------------------------------------------

# 6. Repository Rules

Repository only communicates with database.

No business logic.

Only

findById()

findAll()

save()

delete()

exists...

-------------------------------------------------------

# 7. Mapper Rules

All Entity ↔ DTO conversion belongs here.

Controller never maps.

Repository never maps.

Service uses Mapper.

-------------------------------------------------------

# 8. Validation Flow

Request

↓

Jakarta Validation

↓

Controller

↓

Service Validation

↓

Repository

Example

@NotBlank

@Size

@Email

Business validation

Category duplicated

Category existed

Product existed

...

-------------------------------------------------------

# 9. Exception Flow

Any business error

↓

throw new AppException(ErrorCode.XXX)

↓

GlobalExceptionHandler

↓

ApiResponse

↓

Client

Never throw RuntimeException.

Never return ResponseEntity.badRequest() manually.

-------------------------------------------------------

# 10. ApiResponse

All successful APIs MUST return

ApiResponse<T>

Example

return ApiResponse.success(response);

or

return ApiResponse.success("Created successfully", response);

Never return DTO directly.

Never return Entity.

-------------------------------------------------------

# 11. ErrorCode

Every business exception MUST use ErrorCode.

Example

throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);

Never hardcode message.

Never write

throw new RuntimeException("...")

-------------------------------------------------------

# 12. Naming Convention

Controller

CategoryController

ProductController

UserController

Service

CategoryService

ProductService

Repository

CategoryRepository

Mapper

CategoryMapper

DTO

CategoryCreationRequest

CategoryUpdateRequest

CategoryResponse

-------------------------------------------------------

# 13. Coding Style

Prefer early return.

Avoid nested if.

One method = one responsibility.

Meaningful method names.

Extract private methods when logic becomes large.

-------------------------------------------------------

# 14. AI Generation Rules

When generating code AI MUST

✔ Follow existing package structure.

✔ Reuse ApiResponse.

✔ Reuse ErrorCode.

✔ Throw AppException.

✔ Use DTO.

✔ Use Mapper.

✔ Never expose Entity.

✔ Never duplicate logic.

✔ Keep Controller thin.

✔ Put business logic in Service.

-------------------------------------------------------

# 15. Standard Create Flow

Controller

↓

CreateRequest

↓

Service

↓

Duplicate Validation

↓

Entity

↓

Repository.save()

↓

Mapper

↓

Response DTO

↓

ApiResponse.success()

-------------------------------------------------------

# 16. Standard Update Flow

Controller

↓

UpdateRequest

↓

findById()

↓

if null

throw AppException(ErrorCode...)

↓

Update Entity

↓

save()

↓

Mapper

↓

Response DTO

↓

ApiResponse.success()

-------------------------------------------------------

# 17. Standard Delete Flow

Controller

↓

Service

↓

findById()

↓

Not Found

↓

throw AppException()

↓

delete()

↓

ApiResponse.success()

-------------------------------------------------------

# 18. Standard Get Detail Flow

Controller

↓

Service

↓

Repository.findById()

↓

Mapper

↓

Response DTO

↓

ApiResponse.success()

-------------------------------------------------------

# 19. Standard Get List Flow

Controller

↓

Service

↓

Repository.findAll()

↓

Mapper List

↓

Response DTO List

↓

ApiResponse.success()

-------------------------------------------------------

# 20. Before AI Writes Code

AI should check

1. Existing Entity

2. Existing DTO

3. Existing Repository

4. Existing Mapper

5. Existing ErrorCode

6. Existing ApiResponse

Only create new classes when necessary.

Never modify unrelated files.

# Response Standard

Success

return ApiResponse.success(response);

or

return ApiResponse.success("Create category successfully", response);

Business Error

throw new AppException(ErrorCode.CATEGORY_EXISTED);

System Error

Handled by GlobalExceptionHandler.

Never catch Exception unless necessary.

Never return null.

Never return String message directly.

com.example.teddybearshop

```text
com.example.teddybearshop
│
├── common
│   ├── exception
│   └── response
│
├── configuration
├── controller
├── dto
│   ├── request
│   └── response
├── enums
├── mapper
├── model
├── repository
├── service
└── TeddyBearShopApplication
```