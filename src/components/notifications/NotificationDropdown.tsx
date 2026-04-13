export function NotificationDropdown({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="relative">
      <button className="p-2 hover:bg-muted rounded-full">
        🔔 {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full px-1">{unreadCount}</span>}
      </button>
    </div>
  )
}
