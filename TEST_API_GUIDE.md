# 🧪 API Integration Test Guide

## 📝 Nhanh Chóng

File test: `src/test-api-integration.ts`

### Chạy Test trong Browser Console

1. Mở Developer Tools (F12)
2. Go to Console tab
3. Paste các lệnh dưới đây:

---

## 🔐 Auth Tests

### 1. Đăng Ký (Register)
```javascript
const { testRegister } = await import('./test-api-integration.ts');
testRegister('test@example.com', 'Password123!');
```

### 2. Đăng Nhập (Login)
```javascript
const { testLogin } = await import('./test-api-integration.ts');
testLogin('test@example.com', 'Password123!');
```

### 3. Làm Mới Token (Refresh)
```javascript
const { testRefreshToken } = await import('./test-api-integration.ts');
testRefreshToken();
```

---

## 📦 Product Tests

### 1. Lấy Danh Sách Sản Phẩm
```javascript
const { testGetProducts } = await import('./test-api-integration.ts');
testGetProducts();
```

### 2. Lấy Chi Tiết Sản Phẩm
```javascript
const { testGetProductDetail } = await import('./test-api-integration.ts');
testGetProductDetail('product-id-here');
```

### 3. Tạo Sản Phẩm (Cần Login)
```javascript
const { testCreateProduct, testLogin } = await import('./test-api-integration.ts');
await testLogin('test@example.com', 'Password123!');
await testCreateProduct({
  name: 'Xe Đạp Test',
  description: 'Mô tả sản phẩm',
  price: 5000000,
  category: 'road-bike'
});
```

---

## 📍 Location Tests

### 1. Lấy Danh Sách Tỉnh/Thành
```javascript
const { testGetProvinces } = await import('./test-api-integration.ts');
testGetProvinces();
```

### 2. Lấy Quận/Huyện theo Tỉnh
```javascript
const { testGetDistricts } = await import('./test-api-integration.ts');
testGetDistricts('province-code-here');
```

### 3. Lấy Phường/Xã theo Quận
```javascript
const { testGetWards } = await import('./test-api-integration.ts');
testGetWards('district-code-here');
```

---

## 👤 Profile Tests

### 1. Lấy Hồ Sơ (Cần Login)
```javascript
const { testGetProfile, testLogin } = await import('./test-api-integration.ts');
await testLogin('test@example.com', 'Password123!');
await testGetProfile();
```

### 2. Cập Nhật Hồ Sơ (Cần Login)
```javascript
const { testUpdateProfile, testLogin } = await import('./test-api-integration.ts');
await testLogin('test@example.com', 'Password123!');
await testUpdateProfile({
  firstName: 'Nguyễn',
  lastName: 'Văn B',
  phone: '0901234567'
});
```

---

## 📋 Order Tests

### 1. Lấy Danh Sách Đơn Hàng (Cần Login)
```javascript
const { testGetOrders, testLogin } = await import('./test-api-integration.ts');
await testLogin('test@example.com', 'Password123!');
await testGetOrders();
```

### 2. Tạo Đơn Hàng (Cần Login)
```javascript
const { testCreateOrder, testLogin } = await import('./test-api-integration.ts');
await testLogin('test@example.com', 'Password123!');
await testCreateOrder({
  productId: 'product-id-here',
  quantity: 1,
  deliveryAddress: '123 Main St'
});
```

---

## 🚀 Chạy Tất Cả Test

```javascript
const { runAllTests } = await import('./test-api-integration.ts');
runAllTests();
```

---

## 💻 Chạy Bằng cURL

### 1. Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "phone": "0901234567",
    "role": "buyer"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### 3. Get Products
```bash
curl -X GET http://localhost:8080/api/products \
  -H "Content-Type: application/json"
```

### 4. Get Provinces
```bash
curl -X GET http://localhost:8080/api/locations/provinces \
  -H "Content-Type: application/json"
```

### 5. Lấy Profile (Cần Authorization)
```bash
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
```

---

## ⚙️ Config

Để thay đổi API base URL, chỉnh sửa file `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
# Hoặc thay bằng URL production
# VITE_API_BASE_URL=https://api.example.com
```

---

## 📌 Ghi Chú

- Các test cần authentication sẽ tự động lưu token sau khi login
- Token được sử dụng cho các request tiếp theo
- Nếu gặp lỗi CORS, hãy kiểm tra backend có enable CORS không
- Tất cả lỗi sẽ được log chi tiết trong console
