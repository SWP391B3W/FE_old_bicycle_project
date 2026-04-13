import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SellerReviewsSection } from './SellerReviewsSection'

const { getSellerReviewsMock, replyMock } = vi.hoisted(() => ({
  getSellerReviewsMock: vi.fn(),
  replyMock: vi.fn(),
}))

vi.mock('@/api/reviews.api', () => ({
  reviewsApi: {
    getSellerReviews: getSellerReviewsMock,
    reply: replyMock,
  },
}))

describe('SellerReviewsSection', () => {
  beforeEach(() => {
    getSellerReviewsMock.mockReset()
    replyMock.mockReset()
  })

  it('loads seller reviews and lets the seller reply', async () => {
    const user = userEvent.setup()

    getSellerReviewsMock.mockResolvedValue({
      content: [
        {
          id: 'review-1',
          orderId: 'order-1',
          reviewerId: 'buyer-1',
          reviewerName: 'Buyer Alpha',
          revieweeId: 'seller-1',
          revieweeName: 'Seller Road',
          rating: 5,
          comment: 'Xe đẹp và giao dịch rõ ràng.',
          sellerReply: null,
          sellerRepliedAt: null,
          createdAt: '2026-03-20T09:00:00Z',
        },
      ],
    })

    replyMock.mockResolvedValue({
      id: 'review-1',
      orderId: 'order-1',
      reviewerId: 'buyer-1',
      reviewerName: 'Buyer Alpha',
      revieweeId: 'seller-1',
      revieweeName: 'Seller Road',
      rating: 5,
      comment: 'Xe đẹp và giao dịch rõ ràng.',
      sellerReply: 'Cảm ơn bạn, mình luôn sẵn sàng hỗ trợ thêm.',
      sellerRepliedAt: '2026-03-20T10:00:00Z',
      createdAt: '2026-03-20T09:00:00Z',
    })

    render(<SellerReviewsSection sellerId="seller-1" />)

    expect(await screen.findByText('Buyer Alpha')).toBeInTheDocument()
    expect(screen.getByText('Xe đẹp và giao dịch rõ ràng.')).toBeInTheDocument()

    await user.type(
      screen.getByLabelText(/phản hồi với buyer/i),
      'Cảm ơn bạn, mình luôn sẵn sàng hỗ trợ thêm.',
    )
    await user.click(screen.getByRole('button', { name: /gửi phản hồi/i }))

    await waitFor(() => {
      expect(replyMock).toHaveBeenCalledWith('review-1', {
        reply: 'Cảm ơn bạn, mình luôn sẵn sàng hỗ trợ thêm.',
      })
    })

    expect(await screen.findByText(/phản hồi hiện tại của bạn/i)).toBeInTheDocument()
  })
})
