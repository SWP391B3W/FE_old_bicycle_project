import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { getSocketBaseUrl } from '@/sockets/chat.stomp'
import type { NotificationItem } from '@/types/notification'

function parseNotification(frame: IMessage): NotificationItem {
  return JSON.parse(frame.body) as NotificationItem
}

export interface NotificationSocketClient {
  connect: () => Promise<void>
  subscribeToNotifications: (onNotification: (notification: NotificationItem) => void) => () => void
  disconnect: () => Promise<void>
}

export function createNotificationSocketClient(token: string): NotificationSocketClient {
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

  let connectPromise: Promise<void> | null = null
  let subscription: StompSubscription | null = null

  return {
    connect() {
      if (client.connected) {
        return Promise.resolve()
      }

      if (connectPromise) {
        return connectPromise
      }

      connectPromise = new Promise<void>((resolve, reject) => {
        client.onConnect = () => {
          connectPromise = null
          resolve()
        }

        client.onStompError = (frame) => {
          connectPromise = null
          reject(new Error(frame.headers.message ?? 'STOMP connection failed'))
        }

        client.onWebSocketError = () => {
          connectPromise = null
          reject(new Error('WebSocket connection failed'))
        }

        if (!client.active) {
          client.activate()
        }
      })

      return connectPromise
    },

    subscribeToNotifications(onNotification) {
      subscription?.unsubscribe()
      subscription = client.subscribe('/user/queue/notifications', (frame) => {
        onNotification(parseNotification(frame))
      })

      return () => {
        subscription?.unsubscribe()
        subscription = null
      }
    },

    async disconnect() {
      subscription?.unsubscribe()
      subscription = null

      if (!client.active) {
        return
      }

      await client.deactivate()
    },
  }
}
