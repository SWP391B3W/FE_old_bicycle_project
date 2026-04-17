import { getResult, putResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { NotificationItem } from '@/types/notification'

export const notificationsApi = {
  getMine(page = 0, size = 15) {
    return getResult<PageResult<NotificationItem>>('/api/notifications/me', {
      params: { page, size },
    })
  },

  getUnreadCount() {
    return getResult<number>('/api/notifications/me/unread-count')
  },

  markAsRead(notificationId: string) {
    return putResult<void>(`/api/notifications/${notificationId}/read`)
  },

  markAllAsRead() {
    return putResult<void>('/api/notifications/me/read-all')
  },
}
