import { getResult } from '@/lib/http'
import type { Product } from '@/types/product'

export const productsApi = {
  search(params: { page: number; size: number; sortBy: string }) {
    return getResult<{ content: Product[] }>(`/api/products?${new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
      sort: params.sortBy,
    }).toString()}`)
  },
}