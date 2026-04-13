import type { PaymentMethod } from '@/types/order'

export type PaymentGateway = 'manual' | 'sepay'

export type PaymentPhase = 'upfront' | 'remaining'

export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'expired' | 'refunded'

export interface PaymentRequestResponse {
  paymentId: string
  orderId: string
  gateway: PaymentGateway
  phase: PaymentPhase
  status: PaymentStatus
  amount: number
  protectedAmount?: number | null
  buyerFeeAmount?: number | null
  gatewayOrderCode?: string | null
  checkoutUrl?: string | null
  qrCodeUrl?: string | null
  transferContent?: string | null
  bankBin?: string | null
  bankAccountNumber?: string | null
  bankAccountName?: string | null
  mockMode: boolean
  instructions?: string | null
  expiresAt?: string | null
}

export interface PaymentHistoryItem {
  id: string
  orderId: string
  amount: number
  protectedAmount?: number | null
  buyerFeeAmount?: number | null
  gateway: PaymentGateway
  method: PaymentMethod
  phase: PaymentPhase
  status: PaymentStatus
  gatewayOrderCode?: string | null
  transactionReference?: string | null
  checkoutUrl?: string | null
  qrCodeUrl?: string | null
  paymentDate?: string | null
  expiresAt?: string | null
  createdAt: string
}