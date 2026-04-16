import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Conversation } from './mockData'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: Readonly<ConversationListProps>) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    if (!keyword) {
      return conversations
    }

    return conversations.filter((conversation) =>
      [conversation.partnerName, conversation.lastMessage, conversation.bikeTitle]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }, [conversations, searchQuery])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-4">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Tin nhắn</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="bg-white pl-9"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-slate-500">
          Không tìm thấy cuộc trò chuyện phù hợp.
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {filteredConversations.map((conversation) => {
              const partnerInitial = conversation.partnerName.slice(0, 1).toUpperCase()

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelect(conversation)}
                  className={`flex items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                    selectedId === conversation.id ? 'bg-sky-50' : 'hover:bg-slate-100'
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.partnerAvatar} alt={conversation.partnerName} />
                    <AvatarFallback>{partnerInitial}</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-slate-900">{conversation.partnerName}</span>
                      <div className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        )}
                        <span className="whitespace-nowrap text-xs text-slate-500">{conversation.lastMessageTime}</span>
                      </div>
                    </div>

                    <span className="mt-0.5 truncate text-sm text-slate-600">{conversation.lastMessage}</span>
                    <span className="mt-1 truncate text-xs text-sky-600">🚲 {conversation.bikeTitle}</span>
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
