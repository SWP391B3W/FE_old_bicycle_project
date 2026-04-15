import { formatPriceDisplay } from '@/lib/currency-input'
import type { Product } from '@/types/product'

const PRODUCT_CONDITION_LABELS: Record<NonNullable<Product['condition']>, string> = {
  new: 'Như mới',
  used: 'Đã qua sử dụng',
  need_repair: 'Cần sửa chữa',
}

export function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

export function getPrimaryImage(product: Product): string {
  return product.images[0] ?? ''
}

export function getProductConditionLabel(condition?: Product['condition']) {
  if (!condition) {
    return null
  }

  return PRODUCT_CONDITION_LABELS[condition]
}

export function getProductLocation(product: Product): string {
  return product.location || 'Chưa cập nhật địa điểm'
}