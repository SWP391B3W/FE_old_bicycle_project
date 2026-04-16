export type PaymentOption = 'partial' | 'full'

export type PaymentMethod = 'transfer' | 'cash' | 'online'

export type OrderEvidenceType = 'seller_handover' | 'buyer_receipt'

export type PlatformFeeStatus = 'not_applicable' | 'pending' | 'recognized' | 'reversed'

export interface OrderEvidenceFile {
  id: string
  fileUrl: string
  fileName?: string | null
  contentType?: string | null
  sortOrder?: number | null
}

export interface OrderEvidenceSubmission {
  id: string
  evidenceType: OrderEvidenceType
  submittedByUserId: string
  submittedByName: string
  submittedByRole: 'guest' | 'buyer' | 'seller' | 'inspector' | 'admin'
  note?: string | null
  createdAt: string
  files: OrderEvidenceFile[]
}

export interface OrderEvidenceInput {
  note?: string
  files?: File[]
}

export type OrderStatus =
  | 'pending'
  | 'deposited'
  | 'awaiting_buyer_confirmation'
  | 'completed'
  | 'cancelled'

export type OrderFundingStatus =
  | 'unpaid'
  | 'awaiting_payment'
  | 'held'
  | 'seller_payout_pending'
  | 'released'
  | 'refund_pending'
  | 'refund_pending_transfer'
  | 'refunded'

export type OrderCancelReason =
  | 'buyer_cancelled'
  | 'seller_rejected'
  | 'seller_cancelled'
  | 'admin_cancelled'
  | 'payment_expired'

export interface Order {
  id: string
  productId: string
  productTitle: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  totalAmount: number
  depositAmount?: number | null
  requiredUpfrontAmount: number
  paidAmount: number
  remainingAmount: number
  serviceFee?: number | null
  feeBaseAmount?: number | null
  platformFeeRate?: number | null
  platformFeeTotal?: number | null
  buyerFeeAmount?: number | null
  sellerFeeAmount?: number | null
  buyerChargeAmount?: number | null
  sellerGrossPayoutAmount?: number | null
  sellerNetPayoutAmount?: number | null
  platformFeeStatus?: PlatformFeeStatus | null
  platformFeeRecognizedAt?: string | null
  platformFeeReversedAt?: string | null
  paymentOption: PaymentOption
  status: OrderStatus
  fundingStatus: OrderFundingStatus
  paymentMethod: PaymentMethod
  buyerReviewSubmitted: boolean
  sellerHandoverEvidence?: OrderEvidenceSubmission | null
  buyerReceiptEvidence?: OrderEvidenceSubmission | null
  acceptedAt?: string | null
  paymentDeadline?: string | null
  cancelReason?: OrderCancelReason | null
  cancelledAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderCreateRequest {
  productId: string
  upfrontAmount?: number
  depositAmount?: number
  paymentOption?: PaymentOption
  paymentMethod: PaymentMethod
}
