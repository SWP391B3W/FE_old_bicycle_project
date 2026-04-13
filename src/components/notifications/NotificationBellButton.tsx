import * as React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationBellButtonProps extends React.ComponentProps<typeof Button> {
  unreadCount: number
}

export const NotificationBellButton = React.forwardRef<HTMLButtonElement, NotificationBellButtonProps>(function NotificationBellButton({
  unreadCount,
  className,
  ...buttonProps
}, ref) {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('relative', className)}
      aria-label="Mở thông báo"
      {...buttonProps}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  )
})
