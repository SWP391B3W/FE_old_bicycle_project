import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConversationList } from '@/components/messages/ConversationList'
import { ChatWindow } from '@/components/messages/ChatWindow'
import { FAKE_CONVERSATIONS, getMessagesForChat, type Conversation, type Message } from '@/components/messages/mockData'

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams()
  const conversationIdFromQuery = searchParams.get('conversationId')

  const [conversations, setConversations] = useState<Conversation[]>(FAKE_CONVERSATIONS)
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>(() => {
    return FAKE_CONVERSATIONS.reduce<Record<string, Message[]>>((accumulator, conversation) => {
      accumulator[conversation.id] = getMessagesForChat(conversation.id)
      return accumulator
    }, {})
  })

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationIdFromQuery ?? FAKE_CONVERSATIONS[0]?.id ?? null,
  )

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  )

  const selectedMessages = selectedConversation ? messagesByConversation[selectedConversation.id] ?? [] : []

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id)
    setConversations((currentConversations) =>
      currentConversations.map((item) =>
        item.id === conversation.id
          ? { ...item, unreadCount: 0 }
          : item,
      ),
    )
  }

  const handleSendMessage = (value: string) => {
    if (!selectedConversation) {
      return
    }

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      text: value,
      isMe: true,
      time: getCurrentTimeLabel(),
      status: 'sent',
    }

    setMessagesByConversation((currentMessages) => ({
      ...currentMessages,
      [selectedConversation.id]: [...(currentMessages[selectedConversation.id] ?? []), newMessage],
    }))

    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: value,
              lastMessageTime: newMessage.time,
            }
          : conversation,
      ),
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <section className="mx-auto h-[calc(100vh-4rem)] max-w-7xl overflow-hidden px-0 sm:px-4 lg:px-6">
        <div className="flex h-full overflow-hidden rounded-none border-slate-200 bg-white shadow-sm sm:rounded-2xl sm:border">
          <div
            className={`
              ${selectedConversation ? 'hidden md:flex' : 'flex'}
              min-h-0 w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-slate-50/70
            `}
          >
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.id ?? null}
              onSelect={handleSelectConversation}
            />
          </div>

          <div
            className={`
              ${selectedConversation ? 'flex' : 'hidden md:flex'}
              min-h-0 flex-1 flex-col bg-white
            `}
          >
            <ChatWindow
              conversation={selectedConversation}
              messages={selectedMessages}
              onBack={() => setSelectedConversationId(null)}
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
