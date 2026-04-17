import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, MessageSquarePlus, MoreVertical, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Conversation, Message } from './mockData'

interface ChatWindowProps {
  conversation: Conversation | null
  messages: Message[]
  onBack: () => void
  onSend: (value: string) => void
}

export function ChatWindow({ conversation, messages, onBack, onSend }: Readonly<ChatWindowProps>) {
  const [inputValue, setInputValue] = useState('')
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!viewportRef.current) {
      return
    }

    viewportRef.current.scrollTop = viewportRef.current.scrollHeight
  }, [messages])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const value = inputValue.trim()

    if (!value) {
      return
    }

    onSend(value)
    setInputValue('')
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200">
          <MessageSquarePlus className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-slate-900">Chưa chọn cuộc trò chuyện</h3>
        <p className="max-w-sm">Chọn một cuộc trò chuyện ở danh sách bên trái để bắt đầu nhắn tin.</p>
      </div>
    )
  }

  const partnerInitial = conversation.partnerName.slice(0, 1).toUpperCase()

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="-ml-2 md:hidden" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.partnerAvatar} alt={conversation.partnerName} />
            <AvatarFallback>{partnerInitial}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-semibold leading-none text-slate-900">{conversation.partnerName}</span>
            <span className="mt-1 text-xs text-slate-500">
              {conversation.isOnline ? 'Đang hoạt động' : 'Hoạt động gần đây'}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="icon" disabled>
          <MoreVertical className="h-5 w-5 text-slate-500" />
        </Button>
      </header>

      <div className="border-b border-slate-200 bg-slate-100 p-3">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <img
            src={conversation.bikeImage}
            alt={conversation.bikeTitle}
            className="h-12 w-12 rounded object-cover"
          />
          <div className="flex-1">
            <span className="line-clamp-1 text-sm font-medium text-slate-900">{conversation.bikeTitle}</span>
            <span className="text-xs text-slate-500">{conversation.bikePrice}</span>
          </div>
          <Badge variant="secondary">{conversation.bikeStatus}</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-4">
          <div className="my-4 flex justify-center">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">Hôm nay</span>
          </div>

          {messages.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện đầu tiên.
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="flex max-w-[78%] flex-col gap-1 md:max-w-[68%]">
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      message.isMe
                        ? 'rounded-br-sm bg-sky-600 text-white'
                        : 'rounded-bl-sm border border-slate-200 bg-white text-slate-900'
                    }`}
                  >
                    {message.text}
                  </div>
                  <div className={`flex text-[10px] text-slate-500 ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                    {message.time}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-slate-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl items-center gap-2">
          <Input
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-full"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={!inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
