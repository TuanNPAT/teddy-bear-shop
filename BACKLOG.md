# Backlog

## User Management (Admin)

Tách thành task riêng, không trộn với việc chỉnh luồng trạng thái đơn hàng:

- `GET /users` — lấy danh sách User thật trong database để quản lý.
- `PATCH /users/{id}/status` — cập nhật trạng thái User thật trong database.
- `PATCH /users/{id}/role` — cập nhật vai trò User thật trong database.

Lưu ý: đây là User Management thật, khác với UI `AdminStaff.tsx` đang mock Staff bằng localStorage.
