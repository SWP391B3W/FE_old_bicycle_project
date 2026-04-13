import { getPublicVisibilityHint, hasExpiredInspection, isBlockedFromPublicVisibility } from '@/lib/product-visibility'
import type { Product, ProductStatus } from '@/types/product'

const STATUS_CLASS: Record<ProductStatus, string> = {
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  hidden: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  sold: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  pending_inspection: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  inspected_passed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  inspected_failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

interface SellerListingStatusPresentation {
  label: string
  className: string
  hint: string | null
  isPubliclyVisible: boolean
}

export function getSellerListingStatusPresentation(product: Product): SellerListingStatusPresentation {
  if (product.lockedForTransaction) {
    return {
      label: 'Tạm khóa vì đã chốt giao dịch',
      className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
      hint: 'Listing đã có đơn được seller chấp nhận hoặc đã nhận tiền đặt trước, nên buyer khác không còn thấy ngoài marketplace.',
      isPubliclyVisible: false,
    }
  }

  if (product.sellerActionLocked) {
    return {
      label: 'Đang có yêu cầu mua chờ phản hồi',
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      hint: 'Listing vẫn đang hiển thị công khai, nhưng người bán chưa thể sửa, ẩn hoặc xóa khi còn yêu cầu mua mở.',
      isPubliclyVisible: true,
    }
  }

  if (isBlockedFromPublicVisibility(product)) {
    return {
      label: hasExpiredInspection(product) ? 'Hết hạn kiểm định' : 'Chưa đủ điều kiện hiển thị công khai',
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      hint: getPublicVisibilityHint(product),
      isPubliclyVisible: false,
    }
  }

  switch (product.status) {
    case 'pending':
      return {
        label: 'Chờ admin duyệt và chuyển kiểm định',
        className: STATUS_CLASS.pending,
        hint: 'Admin sẽ kiểm duyệt sơ bộ rồi chuyển tin sang kiểm định trước khi public.',
        isPubliclyVisible: false,
      }
    case 'active':
      return {
        label: 'Đang hiển thị công khai',
        className: STATUS_CLASS.active,
        hint: null,
        isPubliclyVisible: true,
      }
    case 'hidden':
      return {
        label: 'Đã ẩn',
        className: STATUS_CLASS.hidden,
        hint: 'Hiện lại sẽ đưa tin về trạng thái chờ duyệt và kiểm định lại.',
        isPubliclyVisible: false,
      }
    case 'sold':
      return {
        label: 'Đã bán',
        className: STATUS_CLASS.sold,
        hint: null,
        isPubliclyVisible: false,
      }
    case 'pending_inspection':
      return {
        label: 'Đang chờ inspector kiểm định',
        className: STATUS_CLASS.pending_inspection,
        hint: 'Inspector đang xử lý đánh giá kỹ thuật cho tin đăng này.',
        isPubliclyVisible: false,
      }
    case 'inspected_passed':
      return {
        label: 'Đã kiểm định đạt và đang hiển thị',
        className: STATUS_CLASS.inspected_passed,
        hint: null,
        isPubliclyVisible: true,
      }
    case 'inspected_failed':
      return {
        label: 'Kiểm định không đạt',
        className: STATUS_CLASS.inspected_failed,
        hint: 'Bạn cần chỉnh sửa tin đăng rồi chờ admin chuyển kiểm định lại.',
        isPubliclyVisible: false,
      }
    default:
      return {
        label: product.status,
        className: STATUS_CLASS.pending,
        hint: null,
        isPubliclyVisible: false,
      }
  }
}