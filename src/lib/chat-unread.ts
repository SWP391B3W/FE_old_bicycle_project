const CHAT_UNREAD_COUNT_KEY = 'chatUnreadCount'

function clampUnreadCount(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0
  }

  return Math.min(Math.trunc(value), 99)
}

export function getStoredChatUnreadCount(): number {
  const rawValue = localStorage.getItem(CHAT_UNREAD_COUNT_KEY)

  if (!rawValue) {
    return 0
  }

  return clampUnreadCount(Number(rawValue))
}

export function setStoredChatUnreadCount(value: number) {
  const nextValue = clampUnreadCount(value)

  if (nextValue === 0) {
    localStorage.removeItem(CHAT_UNREAD_COUNT_KEY)
    return
  }

  localStorage.setItem(CHAT_UNREAD_COUNT_KEY, String(nextValue))
}

export function incrementStoredChatUnreadCount() {
  const nextValue = clampUnreadCount(getStoredChatUnreadCount() + 1)
  setStoredChatUnreadCount(nextValue)
  return nextValue
}

export function clearStoredChatUnreadCount() {
  localStorage.removeItem(CHAT_UNREAD_COUNT_KEY)
}
