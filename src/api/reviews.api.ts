import { getResult, postResult, putResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { Review, ReviewReplyRequest, ReviewRequest } from '@/types/review'

export const reviewsApi = {
  submit(orderId: string, request: ReviewRequest) {
    return postResult<Review, ReviewRequest>(`/api/reviews/${orderId}`, request)
  },

  getSellerReviews(sellerId: string, page = 0, size = 15) {
    return getResult<PageResult<Review>>(`/api/users/${sellerId}/reviews`, {
      params: { page, size },
    })
  },

  reply(reviewId: string, request: ReviewReplyRequest) {
    return putResult<Review, ReviewReplyRequest>(`/api/reviews/${reviewId}/reply`, request)
  },
}