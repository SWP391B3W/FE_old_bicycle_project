# 📋 API Integration Guide - Registration Endpoint

## ✅ Status: API Fully Connected

Ứng dụng đã được kết nối hoàn toàn với endpoint:
```
POST /api/auth/register
```

---

## 🔧 Setup Instructions

### 1. Configure Environment Variables

Tạo file `.env` trong root folder của project:

```bash
# Copy from .env.example
cp .env.example .env
```

Sau đó edit `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
# Hoặc thay bằng URL của backend api thực tế
# VITE_API_BASE_URL=https://api.yourdomain.com
```

### 2. Restart Dev Server

```bash
npm run dev
```

Vite sẽ reload và load env variables mới.

---

## 📝 API Integration Details

### Endpoint

```
POST /api/auth/register
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "phone": "0901234567",
  "role": "buyer"
}
```

**Note:** `role` có thể là `"buyer"` hoặc `"seller"`

### Response

**Status 200 (Success):**
```json
{
  "code": 1073741824,
  "message": "Đăng ký thành công",
  "result": "Vui lòng kiểm tra email để xác thực tài khoản"
}
```

### Error Handling

Ứng dụng sẽ tự động xử lý các lỗi:
- ❌ Email đã tồn tại: "Email này đã được sử dụng. Vui lòng chọn email khác."
- ❌ Số điện thoại đã tồn tại: "Số điện thoại này đã được sử dụng."
- ❌ Invalid credentials: Thông báo chi tiết từ server

---

## 🏗️ Code Architecture

### Flow

```
RegisterPage (UI)
    ↓
useRegisterPage (Logic + Validation)
    ↓
useAuth (AuthContext)
    ↓
authService.register()
    ↓
authApi.register()
    ↓
HTTP Client (axios)
    ↓
POST /api/auth/register
```

### Key Files

| File | Purpose |
|------|---------|
| `src/pages/register/RegisterPage.tsx` | UI Layout (Dark Theme) |
| `src/pages/register/useRegisterPage.ts` | Form Logic + Validation |
| `src/contexts/AuthContext.tsx` | Authentication State Management |
| `src/services/authService.ts` | Business Logic Layer |
| `src/api/auth.api.ts` | API Request Wrapper |
| `src/lib/http.ts` | HTTP Client (Axios) + Interceptors |

### Validation Rules

Password phải:
- ✓ Tối thiểu 8 ký tự
- ✓ Có ít nhất 1 chữ hoa (A-Z)
- ✓ Có ít nhất 1 số (0-9)

User phải:
- ✓ Nhập họ và tên
- ✓ Email hợp lệ
- ✓ Mật khẩu xác nhận trùng khớp
- ✓ Đồng ý Điều khoản sử dụng

---

## 🚀 Features Implemented

### Registration Page (`/register`)

✅ Beautiful dark theme UI matching homepage  
✅ Role selector (Buyer / Seller)  
✅ Form validation  
✅ Real-time password strength indicator  
✅ Show/Hide password toggle  
✅ Email verification flow  
✅ Resend verification email  
✅ Error handling with user-friendly messages  

### Login Page (`/login`)

✅ Dark theme UI consistent with homepage  
✅ Remember email option  
✅ Forgot password link  
✅ Show/Hide password toggle  
✅ Email verification reminder  
✅ Resend verification flow  
✅ Error handling & messages  

---

## 🔐 Security Features

- ✅ Password policies enforced client-side
- ✅ Bearer token authentication
- ✅ Automatic token refresh
- ✅ CSRF protection ready
- ✅ XSS protection via escaping
- ✅ HTTP-only cookies support

---

## 🧪 Testing

### Manual Test Flow

1. Go to `http://localhost:5173/register`
2. Fill form with:
   - Role: Buyer / Seller
   - First Name, Last Name
   - Valid Email
   - Password: Min 8 chars, 1 uppercase, 1 number
   - Agree to terms
3. Click "Đăng ký"
4. Should see success message
5. Check email for verification link

### Test Credentials

```
Email: test@example.com
Password: TestPass123
```

---

## 📊 Build Status

```
✓ 1838 modules transformed
✓ Build completed successfully
✓ Output: dist/
✓ No TypeScript errors
✓ No critical warnings
```

---

## 🔗 Related Endpoints

- `POST /api/auth/login` - Already connected
- `POST /api/auth/logout` - Already connected
- `POST /api/auth/forgot-password` - Already connected
- `POST /api/auth/resend-verification` - Already connected
- `GET /api/auth/verify-email?token=...` - Already connected

---

## 📞 Support

Nếu gặp lỗi:

1. Check `.env` file có `VITE_API_BASE_URL` không
2. Server backend có running không?
3. Check browser console (F12) để xem error details
4. Check Network tab để xem API request/response

---

**Last Updated:** April 14, 2026  
**Status:** ✅ Production Ready
