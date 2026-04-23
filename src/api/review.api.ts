import { getResult, postResult } from '@/lib/http';
import type { ApiResponse } from '@/types/api';

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment: string;
  content?: string; // Alias for comment in some components
  buyerName?: string; // Alias for reviewerName in some components
  sellerReply?: string;
  sellerRepliedAt?: string;
  createdAt: string;
}

export interface ReviewRequest {
  orderId: string;
  rating: number;
  comment: string;
}

export interface ReviewReplyRequest {
  reply: string;
}

export const reviewApi = {
  submitReview: async (request: ReviewRequest) => {
    return postResult<Review>('/api/reviews', request);
  },
  getSellerReviews: async (sellerId: string, page = 0, size = 10) => {
    return getResult<any>(`/api/reviews/seller/${sellerId}`, {
      params: { page, size }
    });
  },
  getBuyerReviews: async (buyerId: string, page = 0, size = 10) => {
    return getResult<any>(`/api/reviews/buyer/${buyerId}`, {
      params: { page, size }
    });
  },
  replyToReview: async (reviewId: string, request: ReviewReplyRequest) => {
    return postResult<Review>(`/api/reviews/${reviewId}/reply`, request);
  }
};
