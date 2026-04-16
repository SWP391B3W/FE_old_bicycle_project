export type NotificationType =
  | 'order'
  | 'chat'
  | 'system'
  | 'inspection'
  | 'promotion'
  | 'wishlist'

export interface NotificationItem {
  id: string
  userId: string
  title: string
  content: string
  type: NotificationType
  isRead: boolean
  metadata?: string | null
  createdAt: string
}
