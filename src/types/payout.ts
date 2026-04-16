import type { OrderFundingStatus, OrderStatus } from '@/types/order'

export type PayoutType = 'refund' | 'seller_release'

export type PayoutStatus = 'profile_required' | 'pending_transfer' | 'completed' | 'cancelled'

export type PayoutProvider = 'vietqr_manual'

export interface PayoutProfile {
  id: string
  userId: string
  bankCode: string
  bankBin: string
  accountNumber: string
  accountName: string
  updatedAt?: string | null
}

export interface PayoutProfileUpsertRequest {
  bankCode: string
  bankBin: string
  accountNumber: string
  accountName: string
}

export interface AdminPayout {
  id: string
  type: PayoutType
  status: PayoutStatus
  provider: PayoutProvider
  amount: number
  grossAmount?: number | null
  feeDeductionAmount?: number | null
  netAmount?: number | null
  recipientId: string
  recipientName: string
  bankCode?: string | null
  bankBin?: string | null
  accountNumber?: string | null
  accountName?: string | null
  transferContent?: string | null
  qrCodeUrl?: string | null
  bankReference?: string | null
  adminNote?: string | null
  orderId?: string | null
  orderStatus?: OrderStatus | null
  fundingStatus?: OrderFundingStatus | null
  refundRequestId?: string | null
  productId?: string | null
  productTitle?: string | null
  buyerId?: string | null
  buyerName?: string | null
  sellerId?: string | null
  sellerName?: string | null
  completedById?: string | null
  completedByName?: string | null
  completedAt?: string | null
  createdAt: string
}

export interface AdminPayoutFilters {
  keyword?: string
  type?: PayoutType
  status?: PayoutStatus
  page?: number
  size?: number
}

export interface PayoutCompleteRequest {
  bankReference: string
  adminNote?: string
}
