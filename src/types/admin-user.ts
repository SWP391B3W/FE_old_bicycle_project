import type { AppRole, UserStatus } from '@/types/auth'
import type { NotificationType } from '@/types/notification'
import type { PaymentMethod, OrderStatus } from '@/types/order'
import type { ProductStatus } from '@/types/product'
import type { ReportReason, ReportStatus } from '@/types/report'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string | null
  avatarUrl?: string | null
  defaultAddress?: string | null
  role: AppRole
  status: UserStatus
  isVerified: boolean
  averageRating?: number | null
  totalReviews?: number | null
  createdAt: string
  updatedAt: string
}

export interface AdminUserFilters {
  keyword?: string
  role?: AppRole
  status?: UserStatus
  verified?: boolean
  page?: number
  size?: number
}

export interface AdminUserStatusUpdateRequest {
  status: UserStatus
}

export interface AdminUserPasswordResetRequest {
  newPassword: string
}

export interface AdminUserActivity {
  userId: string
  email: string
  role: AppRole
  status: UserStatus
  verified: boolean
  createdAt: string
  updatedAt: string
  totalProducts: number
  totalOrdersAsBuyer: number
  totalOrdersAsSeller: number
  totalReportsSubmitted: number
  totalWishlistItems: number
  totalConversations: number
  unreadNotifications: number
  recentProducts: AdminRecentProduct[]
  recentOrders: AdminRecentOrder[]
  recentReports: AdminRecentReport[]
  recentNotifications: AdminRecentNotification[]
  recentWishlistItems: AdminRecentWishlistItem[]
}

export interface AdminRecentProduct {
  productId: string
  title: string
  price: number
  status: ProductStatus
  createdAt: string
}

export interface AdminRecentOrder {
  orderId: string
  productId: string
  productTitle: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  totalAmount: number
  involvement: string
  createdAt: string
}

export interface AdminRecentReport {
  reportId: string
  targetId: string
  targetType: string
  reason: ReportReason
  status: ReportStatus
  createdAt: string
}

export interface AdminRecentNotification {
  notificationId: string
  title: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export interface AdminRecentWishlistItem {
  productId: string
  productTitle: string
  productStatus: ProductStatus
  createdAt: string
}
