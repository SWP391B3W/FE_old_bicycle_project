import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Loader2, MessageSquarePlus, MoreVertical, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { chatApi } from '@/api/chat.api'
import { authService } from '@/services/authService'
import { cn } from '@/lib/utils'
import { createChatSocketClient, type ChatSocketClient } from '@/sockets/chat.stomp'
import {
  appendLiveMessage,
  formatMessageTimestamp,
  getConversationPartner,
  normalizeMessagesChronologically,
} from '@/lib/chat-display'
import type { ChatMessage, Conversation } from '@/types/chat'

interface ChatWindowProps {
  conversation: Conversation | null
  onBack: () => void
}

const REALTIME_CONNECTION_WARNING = 'Kết nối realtime đang gián đoạn. Hệ thống sẽ tự thử kết nối lại.'
const INITIAL_CONNECTION_WARNING_DELAY_MS = 8000
const CHAT_CONTENT_WIDTH_CLASS = 'max-w-3xl'

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

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSocketReady, setIsSocketReady] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<ChatSocketClient | null>(null)
  const hasConnectedRealtimeRef = useRef(false)
  const currentUserId = user?.id ?? ''

  const partner = useMemo(() => {
    if (!conversation || !currentUserId) {
      return null
    }

    return getConversationPartner(conversation, currentUserId)
  }, [conversation, currentUserId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!conversation || !user) {
      setMessages([])
      setLoading(false)
      setIsSocketReady(false)
      setError(null)
      return
    }

    let cancelled = false
    let unsubscribeConversation: (() => void) | null = null
    let unsubscribeConnectionState: (() => void) | null = null
    let fallbackRefreshIntervalId: number | null = null
    let initialConnectionWarningTimeoutId: number | null = null
    const token = authService.getToken()
    const activeConversation = conversation
    const activeUser = user

    function clearInitialConnectionWarningTimeout() {
      if (initialConnectionWarningTimeoutId !== null) {
        window.clearTimeout(initialConnectionWarningTimeoutId)
        initialConnectionWarningTimeoutId = null
      }
    }

    async function refreshMessages() {
      const messagePage = await chatApi.getMessages(activeConversation.id, 0, 50)

      if (cancelled) {
        return
      }

      setMessages(normalizeMessagesChronologically(messagePage.content))
    }

    async function loadConversation() {
      setLoading(true)
      setError(null)
      setMessages([])
      setIsSocketReady(false)
      hasConnectedRealtimeRef.current = false

      try {
        await refreshMessages()
        await chatApi.markAsRead(activeConversation.id)

        if (!token) {
          return
        }

        const socketClient = createChatSocketClient(token)
        socketRef.current = socketClient

        unsubscribeConnectionState = socketClient.addConnectionListener((connected) => {
          if (cancelled) {
            return
          }

          setIsSocketReady(connected)

          if (connected) {
            hasConnectedRealtimeRef.current = true
            clearInitialConnectionWarningTimeout()
            setError((currentError) => (currentError === REALTIME_CONNECTION_WARNING ? null : currentError))
            return
          }

          if (hasConnectedRealtimeRef.current) {
            setError((currentError) => {
              if (currentError && currentError !== REALTIME_CONNECTION_WARNING) {
                return currentError
              }

              return REALTIME_CONNECTION_WARNING
            })
            return
          }

          clearInitialConnectionWarningTimeout()
          initialConnectionWarningTimeoutId = window.setTimeout(() => {
            if (cancelled || hasConnectedRealtimeRef.current || socketClient.isConnected()) {
              return
            }

            setError((currentError) => {
              if (currentError && currentError !== REALTIME_CONNECTION_WARNING) {
                return currentError
              }

              return REALTIME_CONNECTION_WARNING
            })
          }, INITIAL_CONNECTION_WARNING_DELAY_MS)
        })

        await socketClient.connect()

        if (cancelled) {
          await socketClient.disconnect()
          return
        }

        unsubscribeConversation = socketClient.subscribeToConversation(activeConversation.id, (incomingMessage) => {
          setMessages((currentMessages) => appendLiveMessage(currentMessages, incomingMessage))

          if (incomingMessage.senderId !== activeUser.id) {
            void chatApi.markAsRead(activeConversation.id)
          }
        })

        fallbackRefreshIntervalId = window.setInterval(() => {
          void refreshMessages()
        }, 5000)
      } catch (requestError) {
        if (!cancelled) {
          clearInitialConnectionWarningTimeout()
          setError(getErrorMessage(requestError, 'Không thể tải cuộc trò chuyện lúc này.'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadConversation()

    return () => {
      cancelled = true
      setIsSocketReady(false)
      clearInitialConnectionWarningTimeout()
      unsubscribeConversation?.()
      unsubscribeConnectionState?.()
      if (fallbackRefreshIntervalId !== null) {
        window.clearInterval(fallbackRefreshIntervalId)
      }

      const socketClient = socketRef.current
      socketRef.current = null

      if (socketClient) {
        void socketClient.disconnect()
      }
    }
  }, [conversation, user])

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!conversation || !inputValue.trim()) {
      return
    }

    const socketClient = socketRef.current

    if (!socketClient || !socketClient.isConnected()) {
      setError('Kết nối chat realtime chưa sẵn sàng. Vui lòng thử lại sau vài giây.')
      return
    }

    socketClient.sendMessage({
      conversationId: conversation.id,
      content: inputValue.trim(),
    })

    setInputValue('')
    setError(null)

    window.setTimeout(() => {
      if (!conversation) {
        return
      }

      void chatApi
        .getMessages(conversation.id, 0, 50)
        .then((messagePage) => {
          setMessages(normalizeMessagesChronologically(messagePage.content))
        })
        .catch(() => {
          // Realtime already handles the happy path; this is only a silent fallback refresh.
        })
    }, 500)
  }

  if (!conversation || !partner) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <MessageSquarePlus className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Chưa chọn cuộc trò chuyện</h3>
        <p className="max-w-sm">
          Chọn một cuộc trò chuyện từ danh sách hoặc bắt đầu nhắn tin mới từ trang chi tiết xe đạp.
        </p>
      </div>
    )
  }

  const partnerInitial = partner.name.slice(0, 1).toUpperCase()
  const shouldAnchorMessagesToBottom = !loading && messages.length > 0

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="-ml-2 md:hidden" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback>{partnerInitial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold leading-none">{partner.name}</span>
            <span className="mt-1 text-xs text-muted-foreground">
              {isSocketReady ? 'Đã kết nối realtime' : 'Đang kết nối...'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" disabled>
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>

      <div className="border-b bg-muted/30 p-3">
        <div className={cn('mx-auto flex w-full items-center gap-3', CHAT_CONTENT_WIDTH_CLASS)}>
          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
            🚲
          </div>
          <div className="flex-1">
            <span className="line-clamp-1 text-sm font-medium">{conversation.productTitle}</span>
            <span className="text-xs text-muted-foreground">Cuộc trò chuyện gắn với sản phẩm này</span>
          </div>
          <Badge variant="secondary">Chat mua bán</Badge>
        </div>
      </div>

      {error && (
        <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div
          className={cn(
            'mx-auto flex w-full flex-col gap-4 pb-4',
            CHAT_CONTENT_WIDTH_CLASS,
            shouldAnchorMessagesToBottom && 'min-h-full justify-end',
          )}
        >
          <div className="my-4 flex justify-center">
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">Hôm nay</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải tin nhắn...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện đầu tiên.
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === currentUserId

              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex max-w-[78%] flex-col gap-1 md:max-w-[68%]">
                    <div
                      className={`
                        rounded-2xl px-4 py-2 text-sm
                        ${
                          isMine
                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                            : 'rounded-bl-sm border bg-muted text-foreground'
                        }
                      `}
                    >
                      {message.content}
                    </div>
                    <div className={`flex text-[10px] text-muted-foreground ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {formatMessageTimestamp(message.createdAt)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <form onSubmit={handleSend} className={cn('mx-auto flex w-full items-center gap-2', CHAT_CONTENT_WIDTH_CLASS)}>
          <Input
            placeholder={isSocketReady ? 'Nhập tin nhắn...' : 'Đang chờ kết nối realtime...'}
            className="flex-1 rounded-full border-transparent bg-muted/50 transition-colors focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            disabled={!isSocketReady}
          />
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={!inputValue.trim() || !isSocketReady}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
