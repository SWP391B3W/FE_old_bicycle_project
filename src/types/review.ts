export interface ReviewRequest {
  rating: number
  comment: string
}

export interface ReviewReplyRequest {
  reply: string
}

export interface Review {
  id: string
  orderId: string
  reviewerId: string
  reviewerName: string
  revieweeId: string
  revieweeName: string
  rating: number
  comment: string
  sellerReply?: string | null
  sellerRepliedAt?: string | null
  createdAt: string
}