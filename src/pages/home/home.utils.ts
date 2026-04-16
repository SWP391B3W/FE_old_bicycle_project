import { formatPriceDisplay } from '@/lib/currency-input'
import type { Product } from '@/types/product'

const PRODUCT_CONDITION_LABELS: Record<string, string> = {
  new: 'Mới',
  new_90: 'Mới 90%',
  used: 'Đã qua sử dụng',
  need_repair: 'Cần sửa chữa',
  needs_repair: 'Cần sửa chữa',
}

export function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

export function getPrimaryImage(product: Product): string {
  if (!product.images || product.images.length === 0) {
    return ''
  }

  // Support both legacy string[] and new ProductImage[] systems during transition
  const firstImage = product.images[0]
  if (typeof firstImage === 'string') {
    return firstImage
  }

  // Use primary logic or just the first image
  const primary = product.images.find(img => img.isPrimary) || product.images[0]
  return primary.url
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