import { CreditCard, Home, LayoutDashboard, LogOut, ShieldCheck, ShoppingBag, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleLabel, getRoleWorkspaceEntries } from '@/layouts/app-header-visibility'
import { cn } from '@/lib/utils'

interface UserAccountMenuProps {
  triggerClassName?: string
  contentClassName?: string
  isDarkHeader?: boolean
}

function getEntryIcon(label: string) {
  if (label.includes('bán') || label.includes('mua')) {
    return ShoppingBag
  }

  if (label.includes('kiểm định') || label.includes('quản trị')) {
    return ShieldCheck
  }

  if (label.includes('tiền')) {
    return CreditCard
  }

  return LayoutDashboard
}

export function UserAccountMenu({ triggerClassName, contentClassName, isDarkHeader = true }: Readonly<UserAccountMenuProps>) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const workspaceEntries = getRoleWorkspaceEntries(user?.role)
  const roleLabel = getRoleLabel(user?.role)
  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || user?.email || 'Tài khoản'

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.HOME)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm transition-colors hover:bg-slate-50',
            isDarkHeader && 'border-white/12 bg-white/5 shadow-slate-950/20 hover:bg-white/8',
            triggerClassName,
          )}
        >
          <Avatar className={cn('h-9 w-9 border border-slate-200', isDarkHeader && 'border-white/15')}>
            <AvatarImage src={user?.avatar ?? user?.avatarUrl ?? undefined} />
            <AvatarFallback className={cn('bg-slate-100 text-sm font-semibold text-slate-600', isDarkHeader && 'bg-white/10 text-white')}>
              {(displayName || user?.email || 'U')[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 text-left md:block">
            <p className={cn('truncate text-sm font-semibold text-slate-900', isDarkHeader && 'text-white')}>{displayName}</p>
            <p className={cn('truncate text-xs text-slate-500', isDarkHeader && 'text-white/70')}>{roleLabel}</p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={cn('w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl', contentClassName)}>
        <DropdownMenuLabel className="rounded-xl px-3 py-3 font-normal">
          <div className="flex flex-col">
            <p className="text-base font-semibold leading-none text-slate-900">{displayName}</p>
            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-200" />

        <DropdownMenuItem className="rounded-xl px-3 py-3 text-base text-slate-800" onClick={() => navigate(ROUTES.PROFILE)}>
          <User className="mr-2 h-4 w-4" />
          Trang cá nhân
        </DropdownMenuItem>

        <DropdownMenuItem className="rounded-xl px-3 py-3 text-base text-slate-800" onClick={() => navigate(ROUTES.HOME)}>
          <Home className="mr-2 h-4 w-4" />
          Trang mua bán
        </DropdownMenuItem>

        {workspaceEntries.length > 0 ? <DropdownMenuSeparator className="bg-slate-200" /> : null}

        {workspaceEntries.map((entry) => {
          const EntryIcon = getEntryIcon(entry.label)

          return (
            <DropdownMenuItem
              key={`${entry.href}-${entry.label}`}
              className="rounded-xl px-3 py-3 text-base text-slate-800"
              onClick={() => navigate(entry.href)}
            >
              <EntryIcon className="mr-2 h-4 w-4" />
              {entry.label}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator className="bg-slate-200" />

        <DropdownMenuItem className="rounded-xl px-3 py-3 text-base text-red-600 focus:text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}