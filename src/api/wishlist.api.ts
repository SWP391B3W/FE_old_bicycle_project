import { http } from '@/lib/http'
import type { ApiResponse } from '@/types/api'

export interface WishlistItem {
  productId: string
  title: string
  price: number
  status: string
  sellerId: string
  sellerName: string
  primaryImageUrl: string
  addedAt: string
}

export const wishlistApi = {
  getWishlist: async () => {
    const response = await http.get<ApiResponse<WishlistItem[]>>('/api/wishlist')
    return response.data.result
  },

  addToWishlist: async (productId: string) => {
    const response = await http.post<ApiResponse<WishlistItem>>(`/api/wishlist/${productId}`)
    return response.data.result
  },

  removeFromWishlist: async (productId: string) => {
    const response = await http.delete<ApiResponse<string>>(`/api/wishlist/${productId}`)
    return response.data.result
  }
}
