import { getResult } from '@/lib/http'
import type { Category } from '@/types/reference-data'

export const referenceDataApi = {
  getCategories() {
    return getResult<Category[]>('/api/categories')
  },
}