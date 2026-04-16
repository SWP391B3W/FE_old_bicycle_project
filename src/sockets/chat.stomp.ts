import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import type { ChatMessage, SendChatMessageRequest } from '@/types/chat'

type ConnectionListener = (connected: boolean) => void

interface SubscriptionEntry {
  id: string
  destination: string
  onMessage: (message: ChatMessage) => void
  activeSubscription: StompSubscription | null
}

export interface ChatSocketClient {
  connect: () => Promise<void>
  subscribeToConversation: (conversationId: string, onMessage: (message: ChatMessage) => void) => () => void
  subscribeToInbox: (onMessage: (message: ChatMessage) => void) => () => void
  addConnectionListener: (listener: ConnectionListener) => () => void
  sendMessage: (payload: SendChatMessageRequest) => void
  disconnect: () => Promise<void>
  isConnected: () => boolean
}

export function getSocketBaseUrl() {
  const configuredWsBaseUrl = import.meta.env.VITE_WS_BASE_URL?.trim()
  if (configuredWsBaseUrl) {
    return configuredWsBaseUrl.replace(/\/$/, '')
  }

  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!configuredApiBaseUrl) {
    if (import.meta.env.DEV) {
      const devProxyTarget = import.meta.env.VITE_DEV_PROXY_TARGET?.trim()
      return (devProxyTarget || 'http://localhost:8080').replace(/\/$/, '')
    }

    return window.location.origin
  }

  return configuredApiBaseUrl.replace(/\/api\/?$/, '')
}

function parseMessage(frame: IMessage): ChatMessage {
  return JSON.parse(frame.body) as ChatMessage
}

export function createChatSocketClient(token: string): ChatSocketClient {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${getSocketBaseUrl()}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
      authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
  })

  const subscriptions = new Map<string, SubscriptionEntry>()
  const connectionListeners = new Set<ConnectionListener>()
  let connectPromise: Promise<void> | null = null
  let subscriptionSequence = 0

  function notifyConnectionState(connected: boolean) {
    connectionListeners.forEach((listener) => listener(connected))
  }

  function clearActiveSubscriptions() {
    subscriptions.forEach((entry) => {
      entry.activeSubscription = null
    })
  }

  function activateEntry(entry: SubscriptionEntry) {
    entry.activeSubscription?.unsubscribe()
    entry.activeSubscription = client.subscribe(entry.destination, (frame) => {
      entry.onMessage(parseMessage(frame))
    })
  }

  function resubscribeAll() {
    subscriptions.forEach((entry) => {
      activateEntry(entry)
    })
  }

  function createSubscription(destination: string, onMessage: (message: ChatMessage) => void) {
    const id = `subscription-${subscriptionSequence++}`
    const entry: SubscriptionEntry = {
      id,
      destination,
      onMessage,
      activeSubscription: null,
    }

    subscriptions.set(id, entry)

    if (client.connected) {
      activateEntry(entry)
    }

    return () => {
      const currentEntry = subscriptions.get(id)

      if (!currentEntry) {
        return
      }

      currentEntry.activeSubscription?.unsubscribe()
      subscriptions.delete(id)
    }
  }

  client.onConnect = () => {
    resubscribeAll()
    notifyConnectionState(true)
  }

  client.onDisconnect = () => {
    clearActiveSubscriptions()
    notifyConnectionState(false)
  }

  client.onWebSocketClose = () => {
    clearActiveSubscriptions()
    notifyConnectionState(false)
  }

  return {
    connect() {
      if (client.connected) {
        return Promise.resolve()
      }

      if (connectPromise) {
        return connectPromise
      }

      connectPromise = new Promise<void>((resolve, reject) => {
        const resolveConnection = () => {
          connectPromise = null
          resolve()
        }

        const rejectConnection = (error: Error) => {
          connectPromise = null
          notifyConnectionState(false)
          reject(error)
        }

        client.onConnect = () => {
          resubscribeAll()
          notifyConnectionState(true)
          resolveConnection()
        }

        client.onStompError = (frame) => {
          rejectConnection(new Error(frame.headers.message ?? 'STOMP connection failed'))
        }

        client.onWebSocketError = () => {
          rejectConnection(new Error('WebSocket connection failed'))
        }

        if (!client.active) {
          client.activate()
        }
      })

      return connectPromise
    },

    subscribeToConversation(conversationId, onMessage) {
      return createSubscription(`/topic/conversation/${conversationId}`, onMessage)
    },

    subscribeToInbox(onMessage) {
      return createSubscription('/user/queue/messages', onMessage)
    },

    addConnectionListener(listener) {
      connectionListeners.add(listener)
      listener(client.connected)

      return () => {
        connectionListeners.delete(listener)
      }
    },

    sendMessage(payload) {
      client.publish({
        destination: '/app/chat.sendMessage',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    },

    async disconnect() {
      subscriptions.forEach((entry) => entry.activeSubscription?.unsubscribe())
      subscriptions.clear()
      connectionListeners.clear()

      if (!client.active) {
        clearActiveSubscriptions()
        return
      }

      await client.deactivate()
      clearActiveSubscriptions()
    },

    isConnected() {
      return client.connected
    },
  }
}
