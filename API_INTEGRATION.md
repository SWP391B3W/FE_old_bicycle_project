# 📋 API Integration Guide - Full Backend Coverage

Dưới đây là tài liệu chi tiết về các Endpoint API đã được ổn định và sẵn sàng cho Frontend Agent tiến hành fetch dữ liệu.

## 🔧 Base Configuration

- **Base URL**: `http://localhost:8080/api` (Phụ thuộc vào cấu hình `VITE_API_BASE_URL` trong `.env`)
- **Content-Type**: `application/json` (trừ các endpoint Upload dùng `multipart/form-data`)
- **Authentication**: Bearer Token trong Header (`Authorization: Bearer <accessToken>`)

### 📦 Common Response Wrapper
Tất cả API đều trả về format:
```json
{
  "code": 1000,
  "message": "Thao tác thành công",
  "result": { ... }
}
```

---

## 🔐 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Payloads |
|:--- |:--- |:--- |:--- |
| `POST` | `/register` | Đăng ký | `RegisterRequest`: {email, password, firstName, lastName, phone, role} |
| `POST` | `/login` | Đăng nhập | `LoginRequest`: {email, password} |
| `POST` | `/refresh` | Làm mới Token | `RefreshTokenRequest`: {token} |
| `GET` | `/me` | Lấy profile hiện tại | (Cần Bearer Token) |
| `PATCH` | `/profile` | Cập nhật profile | `ProfileUpdateRequest`: {firstName, lastName, phone...} |

---

## 🚲 2. Product Management (`/api/products`)

Dành cho người bán (Seller) và người mua (Buyer).

### 🔍 Lấy danh sách & Tìm kiếm
- **Endpoint**: `GET /api/products`
- **Query Params**: `keyword`, `brandId`, `categoryId`, `minPrice`, `maxPrice`, `condition`, `hasInspection`...

### 📄 Chi tiết sản phẩm
- **Endpoint**: `GET /api/products/{id}`

### ➕ Đăng tin mới (Seller)
- **Endpoint**: `POST /api/products`
- **Format**: `multipart/form-data`
- **Fields**:
  - `request` (JSON Blob): `ProductRequestDTO` {title, description, price, categoryId, brandId...}
  - `images` (Files): Danh sách ảnh
  - `primaryImageIndex`: Index của ảnh đại diện

---

## 🔍 3. Inspection Flow (`/api/inspections`)

Luồng kiểm định dành cho Seller, Admin và Inspector.

### ✅ Gửi yêu cầu kiểm định (Seller)
- **Endpoint**: `POST /api/inspections/request/{productId}`
- **Note**: Chuyển trạng thái sản phẩm sang `pending_inspection`.

### 📝 Đánh giá kiểm định (Inspector)
- **Endpoint**: `POST /api/inspections/evaluate/{productId}`
- **Payload**: `InspectionEvaluationDTO` {passed, frameScore, brakesScore, expertNotes...}
- **Note**: Nếu `passed=true`, sản phẩm sẽ có trạng thái `active` và sẵn sàng hiển thị.

### 📋 Dashboard Kiểm định
- **Endpoint**: `GET /api/inspections/dashboard`

---

## 🛒 4. Order Flow (`/api/orders`)

Giao dịch giữa Người mua và Người bán.

| Action | Endpoint | Role | Transition |
|:--- |:--- |:--- |:--- |
| **Tạo đơn** | `POST /api/orders` | Buyer | `pending` |
| **Chấp nhận** | `PATCH /api/orders/{id}/accept` | Seller | `awaiting_payment` |
| **Xác nhận cọc** | `PATCH /api/orders/{id}/confirm-deposit` | Seller | `deposited` |
| **Hoàn tất giao** | `PATCH /api/orders/{id}/complete` | Seller | `awaiting_buyer_confirmation` |
| **Xác nhận nhận xe**| `PATCH /api/orders/{id}/confirm-received`| Buyer | `completed` |

---

## ⚒️ 5. Master Data (Reference)

Dùng để đổ dữ liệu vào các Dropdown khi Đăng tin hoặc Lọc.
- `GET /api/categories`
- `GET /api/brands`
- `GET /api/brake-types`
- `GET /api/frame-materials`
- `GET /api/groupsets`

---

## ⚠️ 6. Error Codes

Hệ thống trả về các mã lỗi cụ thể trong trường `code`:
- `1005`: Người dùng không tồn tại
- `1009`: Sản phẩm không tồn tại
- `1011`: Trạng thái không hợp lệ (ví dụ: accept đơn đã hủy)
- `1030`: Email hoặc mật khẩu sai
- `1051`: File kiểm định không hợp lệ (phải là PDF)

---
**Last Updated**: April 17, 2026
**Contact**: Backend Team
