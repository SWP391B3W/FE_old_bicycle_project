import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '@/api/notifications.api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants/routes'
import { emitNotificationsUpdated, NOTIFICATIONS_UPDATED_EVENT } from '@/lib/notification-unread'
import { formatNotificationRelativeTime } from '@/lib/notification-time'
import type { NotificationItem } from '@/types/notification'
import { NotificationBellButton } from './NotificationBellButton'

const PREVIEW_SIZE = 8

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

interface NotificationDropdownProps {
  unreadCount: number
  className?: string
}

export function NotificationDropdown({ unreadCount, className }: NotificationDropdownProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadPreviewCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  )

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await notificationsApi.getMine(0, PREVIEW_SIZE)
      setNotifications(result.content)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể tải thông báo lúc này.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    void fetchNotifications()
  }, [fetchNotifications, open])

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      if (open) {
        void fetchNotifications()
      }
    }

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated)

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated)
    }
  }, [fetchNotifications, open])

  const handleMarkRead = async (notification: NotificationItem) => {
    if (notification.isRead) {
      return
    }

    try {
      await notificationsApi.markAsRead(notification.id)
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
      )
      emitNotificationsUpdated()
    } catch {
      // Keep the dropdown usable even if marking a single notification as read fails.
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)

    try {
      await notificationsApi.markAllAsRead()
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
      emitNotificationsUpdated()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể đánh dấu tất cả là đã đọc.'))
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <NotificationBellButton unreadCount={unreadCount} className={className} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(400px,calc(100vw-1rem))] p-0">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Thông báo</p>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Đang tải...' : `${unreadPreviewCount} chưa đọc trong danh sách hiện tại`}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => void handleMarkAllRead()} disabled={markingAll}>
                <CheckCheck className="mr-1 h-4 w-4" />
                {markingAll ? 'Đang xử lý...' : 'Đọc hết'}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="border-b border-border bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="max-h-96 overflow-y-auto" aria-label="Danh sách thông báo">
          {loading ? (
            <div className="space-y-2 p-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Chưa có thông báo nào.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleMarkRead(notification)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    {notification.isRead ? (
                      <Check className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.content}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatNotificationRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            className="w-full justify-center"
            onClick={() => {
              setOpen(false)
              navigate(ROUTES.NOTIFICATIONS)
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
