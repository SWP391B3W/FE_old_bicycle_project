import { getResult, patchResult, postResult, compactParams } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { Product, ProductStatus } from '@/types/product'

export interface AdminProductFilters {
  status?: ProductStatus
  sellerId?: string
  keyword?: string
  page?: number
  size?: number
}

export const adminProductsApi = {
  getAll(filters: AdminProductFilters = {}) {
    return getResult<PageResult<Product>>('/api/admin/products', {
      params: compactParams(filters),
    })
  },

  getById(productId: string) {
    return getResult<Product>(`/api/admin/products/${productId}`)
  },

  updateStatus(productId: string, status: ProductStatus) {
    return patchResult<Product>(`/api/admin/products/${productId}/status`, undefined, {
      params: { status },
    })
  },

  approve(productId: string) {
    return patchResult<Product>(`/api/admin/products/${productId}/approve`)
  },

  routeToInspection(productId: string) {
    return postResult<unknown>(`/api/inspections/request/${productId}`)
  },

  async hide(productId: string) {
    try {
      return await patchResult<Product>(`/api/admin/products/${productId}/hide`)
    } catch {
      // Fallback for backends that support hide on product resource directly.
      return patchResult<Product>(`/api/products/${productId}/hide`)
    }
  },
}
