const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
const MONTH_MS = 30 * DAY_MS

function parseNotificationTimestamp(value: string) {
  const timestampMs = Date.parse(value)
  return Number.isNaN(timestampMs) ? null : timestampMs
}

function formatAbsoluteNotificationTime(timestampMs: number) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestampMs))
}

export function formatNotificationRelativeTime(dateStr: string): string {
  const timestampMs = parseNotificationTimestamp(dateStr)

  if (timestampMs === null) {
    return 'Không rõ thời gian'
  }

  const diffMs = Date.now() - timestampMs

  // Future timestamps usually mean timezone or clock skew.
  if (diffMs < -MINUTE_MS) {
    return formatAbsoluteNotificationTime(timestampMs)
  }

  if (diffMs < MINUTE_MS) {
    return 'Vừa xong'
  }

  if (diffMs < HOUR_MS) {
    return `${Math.floor(diffMs / MINUTE_MS)} phút trước`
  }

  if (diffMs < DAY_MS) {
    return `${Math.floor(diffMs / HOUR_MS)} giờ trước`
  }

  if (diffMs < MONTH_MS) {
    return `${Math.floor(diffMs / DAY_MS)} ngày trước`
  }

  return new Date(timestampMs).toLocaleDateString('vi-VN')
}
