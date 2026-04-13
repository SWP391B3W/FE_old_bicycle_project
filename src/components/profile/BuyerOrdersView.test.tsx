import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BuyerOrdersView } from './BuyerOrdersView'
import type { Order } from '@/types/order'
import type { PaymentRequestResponse } from '@/types/payment'

const {
  getMineOrdersMock,
  createPaymentRequestMock,
  getMyProfileMock,
  createRefundMock,
  submitReviewMock,
} = vi.hoisted(() => ({
  getMineOrdersMock: vi.fn(),
  createPaymentRequestMock: vi.fn(),
  getMyProfileMock: vi.fn(),
  createRefundMock: vi.fn(),
  submitReviewMock: vi.fn(),
}))

vi.mock('@/api/orders.api', () => ({
  ordersApi: {
    getMine: getMineOrdersMock,
    cancel: vi.fn(),
    confirmReceived: vi.fn(),
  },
}))

vi.mock('@/api/payments.api', () => ({
  paymentsApi: {
    createRequest: createPaymentRequestMock,
  },
}))

vi.mock('@/api/payouts.api', () => ({
  payoutsApi: {
    getMyProfile: getMyProfileMock,
  },
}))

vi.mock('@/api/refunds.api', () => ({
  refundsApi: {
    create: createRefundMock,
  },
}))

vi.mock('@/api/reviews.api', () => ({
  reviewsApi: {
    submit: submitReviewMock,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'buyer-1',
      role: 'buyer',
    },
  }),
}))

vi.mock('@/components/profile/DisputeModal', () => ({
  DisputeModal: ({
    isOpen,
    refundAmount,
    onSubmit,
  }: {
    isOpen: boolean
    refundAmount: number
    onSubmit: (values: { reason: string; evidenceNote?: string; files?: File[] }) => Promise<void> | void
  }) =>
    isOpen ? (
      <div>
        <p>RefundAmount:{refundAmount}</p>
        <button
          onClick={() =>
            void onSubmit({
              reason: 'Xe không giống mô tả',
              evidenceNote: 'Ảnh kiểm tra',
              files: [new File(['refund-image'], 'refund-proof.jpg', { type: 'image/jpeg' })],
            })
          }
        >
          Submit refund
        </button>
      </div>
    ) : null,
}))

vi.mock('@/components/profile/OrderEvidenceDialog', () => ({
  OrderEvidenceDialog: () => null,
}))

vi.mock('@/components/profile/OrderEvidenceSection', () => ({
  OrderEvidenceSection: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('@/components/profile/ReviewOrderDialog', () => ({
  ReviewOrderDialog: () => null,
}))

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    productId: 'product-1',
    productTitle: 'Trek Domane AL 4',
    buyerId: 'buyer-1',
    buyerName: 'Buyer One',
    sellerId: 'seller-1',
    sellerName: 'Seller One',
    totalAmount: 20_000_000,
    depositAmount: 4_000_000,
    requiredUpfrontAmount: 4_000_000,
    paidAmount: 0,
    remainingAmount: 16_000_000,
    serviceFee: 400_000,
    feeBaseAmount: 20_000_000,
    platformFeeRate: 0.02,
    platformFeeTotal: 400_000,
    buyerFeeAmount: 200_000,
    sellerFeeAmount: 200_000,
    buyerChargeAmount: 4_200_000,
    sellerGrossPayoutAmount: 4_000_000,
    sellerNetPayoutAmount: 3_800_000,
    platformFeeStatus: 'pending',
    platformFeeRecognizedAt: null,
    platformFeeReversedAt: null,
    paymentOption: 'partial',
    status: 'pending',
    fundingStatus: 'awaiting_payment',
    paymentMethod: 'transfer',
    buyerReviewSubmitted: false,
    sellerHandoverEvidence: null,
    buyerReceiptEvidence: null,
    acceptedAt: '2026-03-25T08:05:00Z',
    paymentDeadline: '2099-03-25T10:00:00Z',
    cancelReason: null,
    cancelledAt: null,
    createdAt: '2026-03-25T08:00:00Z',
    updatedAt: '2026-03-25T08:05:00Z',
    ...overrides,
  }
}

function buildPaymentRequest(orderId: string): PaymentRequestResponse {
  return {
    paymentId: 'payment-1',
    orderId,
    gateway: 'sepay',
    phase: 'upfront',
    status: 'pending',
    amount: 4_200_000,
    protectedAmount: 4_000_000,
    buyerFeeAmount: 200_000,
    gatewayOrderCode: 'OB-ORDER-1',
    checkoutUrl: null,
    qrCodeUrl: 'https://example.com/qr.png',
    transferContent: 'OB-ORDER-1',
    bankBin: '970423',
    bankAccountNumber: '00000645722',
    bankAccountName: 'OLD BICYCLE SYSTEM',
    mockMode: true,
    instructions: 'Transfer by VietQR',
    expiresAt: '2099-03-25T10:00:00Z',
  }
}

describe('BuyerOrdersView', () => {
  beforeEach(() => {
    getMineOrdersMock.mockReset()
    createPaymentRequestMock.mockReset()
    getMyProfileMock.mockReset()
    createRefundMock.mockReset()
    submitReviewMock.mockReset()

    getMineOrdersMock.mockResolvedValue([])
    getMyProfileMock.mockResolvedValue(null)
    submitReviewMock.mockResolvedValue(undefined)
  })

  it('shows buyer payment breakdown after requesting payment instructions', async () => {
    const order = buildOrder()

    getMineOrdersMock.mockResolvedValue([order])
    createPaymentRequestMock.mockResolvedValue(buildPaymentRequest(order.id))

    render(
      <MemoryRouter>
        <BuyerOrdersView />
      </MemoryRouter>,
    )

    await screen.findByText('Trek Domane AL 4')

    expect(screen.getByText(/Phí sàn tổng:/i)).toBeInTheDocument()
    expect(screen.getByText(/Buyer chịu:/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Lấy thông tin thanh toán/i }))

    await waitFor(() => {
      expect(createPaymentRequestMock).toHaveBeenCalledWith(order.id)
    })

    expect(await screen.findByText(/Khoản sàn giữ cho giao dịch:/i)).toBeInTheDocument()
    expect(screen.getByText(/Phí buyer ở bước này:/i)).toBeInTheDocument()
    expect(document.body.textContent).toMatch(/4\.200\.000/)
    expect(document.body.textContent).toMatch(/4\.000\.000/)
    expect(document.body.textContent).toMatch(/200\.000/)
    expect(screen.getByText(/Refund hợp lệ sẽ hoàn lại cho buyer/i)).toBeInTheDocument()
  })

  it('submits refund requests using buyerChargeAmount instead of paidAmount and forwards evidence files', async () => {
    const order = buildOrder({
      status: 'deposited',
      fundingStatus: 'held',
      paidAmount: 4_000_000,
    })

    getMineOrdersMock.mockResolvedValue([order])
    createRefundMock.mockResolvedValue({
      id: 'refund-1',
      orderId: order.id,
      amount: 4_200_000,
      reason: 'Xe không giống mô tả',
      status: 'pending',
      createdAt: '2026-03-25T08:30:00Z',
    })

    render(
      <MemoryRouter>
        <BuyerOrdersView />
      </MemoryRouter>,
    )

    await screen.findByText('Trek Domane AL 4')

    fireEvent.click(screen.getByRole('button', { name: /Yêu cầu hoàn tiền/i }))

    expect(await screen.findByText('RefundAmount:4200000')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Submit refund' }))

    await waitFor(() => {
      expect(createRefundMock).toHaveBeenCalledWith(order.id, {
        amount: 4_200_000,
        reason: 'Xe không giống mô tả',
        evidenceNote: 'Ảnh kiểm tra',
        files: [expect.objectContaining({ name: 'refund-proof.jpg', type: 'image/jpeg' })],
      })
    })
  })
})
