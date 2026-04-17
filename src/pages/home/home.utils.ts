import { formatPriceDisplay } from '@/lib/currency-input'
import type { Product } from '@/types/product'

const PRODUCT_CONDITION_LABELS: Record<string, string> = {
  new: 'Như mới',
  new_90: 'Như mới',
  used: 'Đã qua sử dụng',
  need_repair: 'Cần sửa chữa',
  needs_repair: 'Cần sửa chữa',
}

export function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

export function getPrimaryImage(product: Product): string {
  const firstImage = product.images?.[0]
  if (!firstImage) {
    return ''
  }

  return typeof firstImage === 'string' ? firstImage : firstImage.url
}

export function getProductConditionLabel(condition?: Product['condition']) {
  if (!condition) {
    return null
  }

  return PRODUCT_CONDITION_LABELS[condition] || condition
}

export function getProductLocation(product: Product): string {
  if (product.location) {
    return product.location
  }

  if (product.province && product.district) {
    return `${product.district}, ${product.province}`
  }

  return product.province || product.district || 'Chưa cập nhật địa điểm'
}