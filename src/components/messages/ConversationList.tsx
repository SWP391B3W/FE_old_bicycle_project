import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/AuthContext'
import { chatApi } from '@/api/chat.api'
import { authService } from '@/services/authService'
import {
  formatConversationTimestamp,
  getConversationPartner,
  getConversationPreview,
  getConversationUnreadCount,
  shouldShowConversationInList,
  sortConversationsNewestFirst,
} from '@/lib/chat-display'
import { NOTIFICATIONS_UPDATED_EVENT } from '@/lib/notification-unread'
import { cn } from '@/lib/utils'
import { createChatSocketClient } from '@/sockets/chat.stomp'
import type { Conversation } from '@/types/chat'

interface ConversationListProps {
  selectedId: string | null
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }

    let cancelled = false
    let unsubscribeInbox: (() => void) | null = null
    let disconnectSocket: (() => Promise<void>) | null = null
    const token = authService.getToken()

    async function loadConversations(showLoading = false) {
      if (showLoading) {
        setLoading(true)
      }

      try {
        const result = await chatApi.getMine()

        if (!cancelled) {
          setConversations(sortConversationsNewestFirst(result))
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải danh sách cuộc trò chuyện.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    async function connectInboxSocket() {
      if (!token) {
        return
      }

      try {
        const socketClient = createChatSocketClient(token)
        disconnectSocket = () => socketClient.disconnect()
        await socketClient.connect()

        if (cancelled) {
          await socketClient.disconnect()
          return
        }

        unsubscribeInbox = socketClient.subscribeToInbox(() => {
          void loadConversations(false)
        })
      } catch {
        // Keep polling fallback active if realtime cannot connect.
      }
    }

    void loadConversations(true)
    void connectInboxSocket()

    function handleNotificationsUpdated() {
      void loadConversations(false)
    }

    const intervalId = window.setInterval(() => {
      void loadConversations(false)
    }, 15000)
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated)

    return () => {
      cancelled = true
      unsubscribeInbox?.()
      window.clearInterval(intervalId)
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated)
      if (disconnectSocket) {
        void disconnectSocket()
      }
    }
  }, [selectedId, user])

  const visibleConversations = useMemo(() => {
    return conversations.filter((conversation) => shouldShowConversationInList(conversation, selectedId))
  }, [conversations, selectedId])

  const filteredConversations = useMemo(() => {
    if (!user) {
      return []
    }

    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return visibleConversations
    }

    return visibleConversations.filter((conversation) => {
      const partner = getConversationPartner(conversation, user.id)
      return [partner.name, conversation.productTitle, getConversationPreview(conversation)]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [searchQuery, user, visibleConversations])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="mb-4 text-xl font-bold">Tin nhắn</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="bg-background pl-9"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải cuộc trò chuyện...
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Chưa có cuộc trò chuyện nào phù hợp.
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {filteredConversations.map((conversation) => {
              const partner = user ? getConversationPartner(conversation, user.id) : null
              const partnerName = partner?.name ?? 'Người dùng'
              const partnerInitial = partnerName.slice(0, 1).toUpperCase()
              const unreadCount = getConversationUnreadCount(conversation, selectedId)

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelect(conversation)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/80',
                    selectedId === conversation.id ? 'bg-muted' : 'bg-transparent',
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{partnerInitial}</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">{partnerName}</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatConversationTimestamp(conversation.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'mt-0.5 truncate text-sm',
                        unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {getConversationPreview(conversation)}
                    </span>

                    <span className="mt-1 truncate text-xs text-primary">🚲 {conversation.productTitle}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
