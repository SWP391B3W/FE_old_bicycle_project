/**
 * API Integration Test File
 * Sử dụng file này để test các endpoint API
 * Chạy: npx ts-node src/test-api-integration.ts
 * 
 * Hoặc import vào file khác để test
 */

import axios from 'axios'

// ========== CONFIG ==========
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080'
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

let accessToken = ''
let refreshToken = ''

// ========== HELPER FUNCTIONS ==========

async function testEndpoint<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: any,
  headers?: Record<string, string>,
): Promise<T> {
  try {
    const config: any = {
      method,
      url: `${API_BASE_URL}${path}`,
      headers: {
        ...apiClient.defaults.headers,
        ...headers,
      },
    }

    if (data) {
      config.data = data
    }

    const response = await axios(config)
    return response.data
  } catch (error: any) {
    console.error(`❌ ${method} ${path} failed:`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    })
    throw error
  }
}

// ========== AUTH TESTS ==========

export async function testRegister(email: string, password: string) {
  console.log('\n🔐 Testing Register...')
  const result = await testEndpoint('POST', '/api/auth/register', {
    email,
    password,
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    phone: '0901234567',
    role: 'buyer',
  })
  console.log('✅ Register success:', result)
  return result
}

export async function testLogin(email: string, password: string) {
  console.log('\n🔐 Testing Login...')
  const result = await testEndpoint('POST', '/api/auth/login', {
    email,
    password,
  })
  console.log('✅ Login success:', result)

  if (result.result?.accessToken) {
    accessToken = result.result.accessToken
    refreshToken = result.result.refreshToken
    console.log('💾 Tokens saved')
  }

  return result
}

export async function testRefreshToken() {
  console.log('\n🔄 Testing Refresh Token...')
  if (!refreshToken) {
    console.warn('⚠️ No refresh token available')
    return
  }

  const result = await testEndpoint('POST', '/api/auth/refresh', {
    refreshToken,
  })
  console.log('✅ Refresh token success:', result)

  if (result.result?.accessToken) {
    accessToken = result.result.accessToken
  }

  return result
}

// ========== PRODUCT TESTS ==========

export async function testGetProducts(_filters?: { category?: string; minPrice?: number; maxPrice?: number }) {
  console.log('\n📦 Testing Get Products...')
  const result = await testEndpoint('GET', '/api/products', undefined, {})
  console.log('✅ Get products success:', result)
  return result
}

export async function testGetProductDetail(productId: string) {
  console.log(`\n📦 Testing Get Product Detail (ID: ${productId})...`)
  const result = await testEndpoint('GET', `/api/products/${productId}`)
  console.log('✅ Get product detail success:', result)
  return result
}

export async function testCreateProduct(productData: any) {
  console.log('\n📦 Testing Create Product...')
  if (!accessToken) {
    throw new Error('No access token. Please login first.')
  }

  const result = await testEndpoint('POST', '/api/products', productData, {
    Authorization: `Bearer ${accessToken}`,
  })
  console.log('✅ Create product success:', result)
  return result
}

// ========== ORDER TESTS ==========

export async function testGetOrders() {
  console.log('\n📋 Testing Get Orders...')
  if (!accessToken) {
    throw new Error('No access token. Please login first.')
  }

  const result = await testEndpoint('GET', '/api/orders', undefined, {
    Authorization: `Bearer ${accessToken}`,
  })
  console.log('✅ Get orders success:', result)
  return result
}

export async function testCreateOrder(orderData: any) {
  console.log('\n📋 Testing Create Order...')
  if (!accessToken) {
    throw new Error('No access token. Please login first.')
  }

  const result = await testEndpoint('POST', '/api/orders', orderData, {
    Authorization: `Bearer ${accessToken}`,
  })
  console.log('✅ Create order success:', result)
  return result
}

// ========== USER TESTS ==========

export async function testGetProfile() {
  console.log('\n👤 Testing Get Profile...')
  if (!accessToken) {
    throw new Error('No access token. Please login first.')
  }

  const result = await testEndpoint('GET', '/api/auth/profile', undefined, {
    Authorization: `Bearer ${accessToken}`,
  })
  console.log('✅ Get profile success:', result)
  return result
}

export async function testUpdateProfile(profileData: any) {
  console.log('\n👤 Testing Update Profile...')
  if (!accessToken) {
    throw new Error('No access token. Please login first.')
  }

  const result = await testEndpoint('PUT', '/api/auth/profile', profileData, {
    Authorization: `Bearer ${accessToken}`,
  })
  console.log('✅ Update profile success:', result)
  return result
}

// ========== LOCATION TESTS ==========

export async function testGetProvinces() {
  console.log('\n📍 Testing Get Provinces...')
  const result = await testEndpoint('GET', '/api/locations/provinces')
  console.log('✅ Get provinces success:', result)
  return result
}

export async function testGetDistricts(provinceCode: string) {
  console.log(`\n📍 Testing Get Districts (Province: ${provinceCode})...`)
  const result = await testEndpoint('GET', `/api/locations/districts/${provinceCode}`)
  console.log('✅ Get districts success:', result)
  return result
}

export async function testGetWards(districtCode: string) {
  console.log(`\n📍 Testing Get Wards (District: ${districtCode})...`)
  const result = await testEndpoint('GET', `/api/locations/wards/${districtCode}`)
  console.log('✅ Get wards success:', result)
  return result
}

// ========== TEST SUITE ==========

export async function runAllTests() {
  console.log('🚀 Starting API Integration Tests')
  console.log(`📡 Base URL: ${API_BASE_URL}\n`)

  try {
    // Test Auth
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'TestPass123!'

    await testRegister(testEmail, testPassword)
    await testLogin(testEmail, testPassword)

    // Test Profile
    await testGetProfile()

    // Test Location
    await testGetProvinces()

    // Test Products
    await testGetProducts()

    // Test Orders
    await testGetOrders()

    console.log('\n✨ All tests completed!')
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
  }
}

// ========== QUICK TEST EXAMPLES ==========

/**
 * Ví dụ sử dụng:
 * 
 * 1. Test Register:
 *    testRegister('user@example.com', 'Password123!').catch(console.error)
 *
 * 2. Test Login:
 *    testLogin('user@example.com', 'Password123!').catch(console.error)
 *
 * 3. Test Get Products:
 *    testGetProducts().catch(console.error)
 *
 * 4. Test Get Provinces:
 *    testGetProvinces().catch(console.error)
 *
 * 5. Run All Tests:
 *    runAllTests().catch(console.error)
 */

// Uncomment để chạy test ngay khi load file
// runAllTests().catch(console.error)

export default {
  testRegister,
  testLogin,
  testRefreshToken,
  testGetProducts,
  testGetProductDetail,
  testCreateProduct,
  testGetOrders,
  testCreateOrder,
  testGetProfile,
  testUpdateProfile,
  testGetProvinces,
  testGetDistricts,
  testGetWards,
  runAllTests,
}
