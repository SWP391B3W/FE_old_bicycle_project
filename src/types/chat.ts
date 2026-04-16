export interface Conversation {
  id: string
  productId: string
  productTitle: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  lastMessage?: string | null
  unreadCount?: number
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  imageUrl?: string | null
  isRead?: boolean | null
  createdAt: string
}

export interface SendChatMessageRequest {
  conversationId: string
  senderId?: string
  content: string
  imageUrl?: string
}
