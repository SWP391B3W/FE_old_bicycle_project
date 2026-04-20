import type { Product } from '@/types/product'

export interface SellerListingStatusPresentation {
  label: string
  className: string
  isPubliclyVisible: boolean
  hint?: string
}

export function getSellerListingStatusPresentation(product: Product): SellerListingStatusPresentation {
  if (product.status === 'pending') {
    return {
      label: 'Đang chờ duyệt',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
      isPubliclyVisible: false,
      hint: 'Admin đang xem xét tin đăng này.',
    }
  }

  if (product.status === 'pending_inspection') {
    return {
      label: 'Đang kiểm định',
      className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
      isPubliclyVisible: false,
      hint: 'Xe đang được inspector đánh giá thực tế.',
    }
  }

  if (product.status === 'inspected_passed') {
    return {
      label: 'Chờ thanh toán phí',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      isPubliclyVisible: false,
      hint: 'Xe đạt chuẩn! Hãy thanh toán phí để tin được hiển thị.',
    }
  }

  if (product.status === 'active') {
    return {
      label: 'Đang hiển thị',
      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      isPubliclyVisible: true,
    }
  }

  if (product.status === 'hidden') {
    return {
      label: 'Đang ẩn',
      className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
      isPubliclyVisible: false,
      hint: 'Bạn đã tạm thời ẩn tin này.',
    }
  }

  if (product.status === 'sold') {
    return {
      label: 'Đã bán',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      isPubliclyVisible: false,
    }
  }

  if (product.status === 'inspected_failed') {
    return {
      label: 'Kiểm định thất bại',
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      isPubliclyVisible: false,
      hint: 'Xe không đạt tiêu chuẩn kỹ thuật của BikeExchange.',
    }
  }

  if (product.status === 'rejected') {
    return {
      label: 'Bị từ chối',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      isPubliclyVisible: false,
      hint: 'Tin đăng vi phạm quy định hoặc thông tin không rõ ràng.',
    }
  }

  return {
    label: product.status,
    className: 'bg-gray-100 text-gray-600',
    isPubliclyVisible: false,
  }
}
