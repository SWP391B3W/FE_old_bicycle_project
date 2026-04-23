import type { Product, ProductStatus } from '@/types/product'

export interface ProductTimelineEntry {
  label: string
  value: string
  tone: 'neutral' | 'warning'
}

export interface AdminListingStatusPresentation {
  status: ProductStatus
  labelOverride?: string
  className?: string
  hint: string | null
}

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate
}

function isPublicStatus(status: ProductStatus) {
  return status === 'active' || status === 'inspected_passed'
}

export function formatProductDateTime(value?: string | null): string | null {
  const parsedDate = parseDate(value)
  return parsedDate ? dateTimeFormatter.format(parsedDate) : null
}

export function getInspectionValidUntil(product: Product): Date | null {
  return parseDate(product.inspection?.validUntil)
}

export function hasExpiredInspection(product: Product, now = new Date()): boolean {
  const validUntil = getInspectionValidUntil(product)

  if (!validUntil) {
    return false
  }

  return validUntil.getTime() <= now.getTime()
}

export function isBlockedFromPublicVisibility(product: Product): boolean {
  const status = product.status ?? 'pending'
  return isPublicStatus(status) && !product.isVerified
}

export function getProductTimelineEntries(product: Product, now = new Date()): ProductTimelineEntry[] {
  const timelineEntries: ProductTimelineEntry[] = []
  const inspectionValidUntil = formatProductDateTime(product.inspection?.validUntil)
  const listingExpiresAt = formatProductDateTime(product.expiresAt)
  const isExpired = hasExpiredInspection(product, now)

  // When status is pending/pending_inspection, the inspection was intentionally invalidated
  // by the system as part of the edit/show flow — show neutral 'awaiting' info instead
  const isAwaitingReview =
    product.status === 'pending' || product.status === 'pending_inspection'

  if (isAwaitingReview) {
    // Always show re-inspection notice when in review queue (even if validUntil is null)
    timelineEntries.push({
      label: 'Kiểm định',
      value: 'Chờ kiểm định lại',
      tone: 'neutral',
    })
  } else if (inspectionValidUntil) {
    // Only show inspection expiry info when product is active/visible
    timelineEntries.push({
      label: isExpired ? 'Kiểm định hết hạn' : 'Hạn kiểm định',
      value: inspectionValidUntil,
      tone: isExpired ? 'warning' : 'neutral',
    })
  }

  if (listingExpiresAt) {
    timelineEntries.push({
      label: 'Hạn tin',
      value: listingExpiresAt,
      tone: 'neutral',
    })
  }

  return timelineEntries
}



export function getPublicVisibilityHint(product: Product, now = new Date()): string | null {
  if (!isBlockedFromPublicVisibility(product)) {
    return null
  }

  const inspectionValidUntil = formatProductDateTime(product.inspection?.validUntil)

  if (inspectionValidUntil && hasExpiredInspection(product, now)) {
    return `Buyer không còn thấy tin này ngoài marketplace vì kiểm định đã hết hạn lúc ${inspectionValidUntil}.`
  }

  if (inspectionValidUntil) {
    return `Tin đang có mốc kiểm định ${inspectionValidUntil}, nhưng hiện chưa đủ điều kiện hiển thị công khai.`
  }

  return 'Buyer chưa thấy tin này ngoài marketplace vì tin chưa có kiểm định hợp lệ.'
}

export function getAdminListingStatusPresentation(
  product: Product,
  now = new Date(),
): AdminListingStatusPresentation {
  const status = product.status ?? 'pending'

  if (product.lockedForTransaction) {
    return {
      status,
      labelOverride: 'Đang bị khóa bởi giao dịch mở',
      className:
        'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
      hint: null,
    }
  }

  if (!isBlockedFromPublicVisibility(product)) {
    return {
      status,
      hint: null,
    }
  }

  const inspectionExpired = hasExpiredInspection(product, now)

  return {
    status,
    labelOverride: inspectionExpired ? 'Hết hạn kiểm định' : 'Chưa đủ điều kiện public',
    className:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    hint: getPublicVisibilityHint(product, now),
  }
}
