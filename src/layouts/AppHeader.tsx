import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bike, ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, MessageCircle, Plus, User, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { authService } from '@/services/authService'
import { clearStoredChatUnreadCount, getStoredChatUnreadCount, incrementStoredChatUnreadCount } from '@/lib/chat-unread'
import { useNotificationUnreadCount } from '@/lib/use-notification-unread-count'
import { createChatSocketClient, type ChatSocketClient } from '@/sockets/chat.stomp'
import {
    canAccessSellerEntry,
    getAppHeaderNavigation,
    getSellEntryHref,
} from './app-header-visibility'

function ChatUnreadDot({ unreadCount }: { unreadCount: number }) {
    if (unreadCount <= 0) {
        return null
    }

    return (
        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
        </span>
    )
}

export default function AppHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [chatUnreadCount, setChatUnreadCount] = useState(() => getStoredChatUnreadCount())
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const navigation = getAppHeaderNavigation(user?.role, isAuthenticated)
    const showSellerEntry = canAccessSellerEntry(user?.role, isAuthenticated)
    const sellEntryHref = getSellEntryHref(user?.role, isAuthenticated)
    const notificationUnreadCount = useNotificationUnreadCount()
    const socketRef = useRef<ChatSocketClient | null>(null)
    const activePathRef = useRef(location.pathname)

    useEffect(() => {
        activePathRef.current = location.pathname

        if (location.pathname.startsWith(ROUTES.MESSAGES)) {
            clearStoredChatUnreadCount()
            setChatUnreadCount(0)
        }
    }, [location.pathname])

    useEffect(() => {
        if (!isAuthenticated) {
            clearStoredChatUnreadCount()
            setChatUnreadCount(0)
            return
        }

        const token = authService.getToken()

        if (!token) {
            return
        }

        const socketToken = token
        let cancelled = false
        let unsubscribeInbox: (() => void) | null = null

        async function connectInboxSocket() {
            try {
                const socketClient = createChatSocketClient(socketToken)
                socketRef.current = socketClient

                await socketClient.connect()

                if (cancelled) {
                    await socketClient.disconnect()
                    return
                }

                unsubscribeInbox = socketClient.subscribeToInbox(() => {
                    if (activePathRef.current.startsWith(ROUTES.MESSAGES)) {
                        return
                    }

                    const nextUnreadCount = incrementStoredChatUnreadCount()
                    setChatUnreadCount(nextUnreadCount)
                })
            } catch {
                // Keep the header usable even if the realtime inbox socket cannot connect.
            }
        }

        void connectInboxSocket()

        return () => {
            cancelled = true
            unsubscribeInbox?.()

            const socketClient = socketRef.current
            socketRef.current = null

            if (socketClient) {
                void socketClient.disconnect()
            }
        }
    }, [isAuthenticated])

    const isActive = (path: string) => {
        if (path === ROUTES.HOME) {
            return location.pathname === path
        }

        return location.pathname.startsWith(path)
    }

    const handleLogout = async () => {
        clearStoredChatUnreadCount()
        setChatUnreadCount(0)
        await logout()
        navigate(ROUTES.HOME)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to={ROUTES.HOME} className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Bike className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">BikeExchange</span>
                </Link>

                <div className="hidden gap-1 md:flex">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                'flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                isActive(item.href)
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <span>{item.name}</span>
                            {item.href === ROUTES.MESSAGES && <ChatUnreadDot unreadCount={chatUnreadCount} />}
                        </Link>
                    ))}
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <ThemeToggle />
                    {isAuthenticated && user ? (
                        <>
                            {showSellerEntry && (
                                <Button size="sm" onClick={() => navigate(sellEntryHref)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Đăng tin
                                </Button>
                            )}
                            <NotificationDropdown unreadCount={notificationUnreadCount} />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar ?? undefined} />
                                            <AvatarFallback className="text-sm">
                                                {(user.firstName || user.email)?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="max-w-[120px] truncate text-sm font-medium">
                                            {user.name || user.email}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                                        <User className="mr-2 h-4 w-4" />
                                        Trang cá nhân
                                    </DropdownMenuItem>
                                    {user.role === 'admin' && (
                                        <DropdownMenuItem onClick={() => navigate(ROUTES.ADMIN)}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Trang quản trị
                                        </DropdownMenuItem>
                                    )}
                                    {user.role === 'inspector' && (
                                        <DropdownMenuItem onClick={() => navigate(ROUTES.INSPECTOR)}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Trang kiểm định
                                        </DropdownMenuItem>
                                    )}
                                    {user.role === 'seller' && (
                                        <DropdownMenuItem onClick={() => navigate(ROUTES.SELLER)}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Trang bán hàng
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Đăng nhập
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Đăng ký
                            </Button>
                            <Button size="sm" onClick={() => navigate(sellEntryHref)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Đăng tin
                            </Button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                        <Bike className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                    BikeExchange
                                </SheetTitle>
                            </SheetHeader>

                            <div className="mt-6 flex flex-col gap-2">
                                {isAuthenticated && user && (
                                    <div className="mb-2 flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.avatar ?? undefined} />
                                                <AvatarFallback>{(user.firstName || user.email)?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{user.name || user.email}</span>
                                                <span className="max-w-[150px] truncate text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                        <NotificationDropdown unreadCount={notificationUnreadCount} />
                                    </div>
                                )}

                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors',
                                            isActive(item.href)
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <span>{item.name}</span>
                                        {item.href === ROUTES.MESSAGES && chatUnreadCount > 0 && (
                                            <span className="inline-flex items-center gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                <ChatUnreadDot unreadCount={chatUnreadCount} />
                                            </span>
                                        )}
                                    </Link>
                                ))}

                                <div className="my-4 h-px bg-border" />

                                {isAuthenticated ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => {
                                                navigate(ROUTES.PROFILE)
                                                setMobileMenuOpen(false)
                                            }}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Trang cá nhân
                                        </Button>
                                        {user?.role === 'admin' && (
                                            <Button
                                                variant="outline"
                                                className="justify-start"
                                                onClick={() => {
                                                    navigate(ROUTES.ADMIN)
                                                    setMobileMenuOpen(false)
                                                }}
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Trang quản trị
                                            </Button>
                                        )}
                                        {user?.role === 'inspector' && (
                                            <Button
                                                variant="outline"
                                                className="justify-start"
                                                onClick={() => {
                                                    navigate(ROUTES.INSPECTOR)
                                                    setMobileMenuOpen(false)
                                                }}
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Trang kiểm định
                                            </Button>
                                        )}
                                        {user?.role === 'seller' && (
                                            <Button
                                                variant="outline"
                                                className="justify-start"
                                                onClick={() => {
                                                    navigate(ROUTES.SELLER)
                                                    setMobileMenuOpen(false)
                                                }}
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Trang bán hàng
                                            </Button>
                                        )}
                                        <Button
                                            variant="destructive"
                                            className="justify-start"
                                            onClick={() => {
                                                void handleLogout()
                                                setMobileMenuOpen(false)
                                            }}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Đăng xuất
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => {
                                                navigate(ROUTES.LOGIN)
                                                setMobileMenuOpen(false)
                                            }}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Đăng nhập
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => {
                                                navigate(ROUTES.REGISTER)
                                                setMobileMenuOpen(false)
                                            }}
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Đăng ký
                                        </Button>
                                        {showSellerEntry && (
                                            <Button
                                                className="justify-start"
                                                onClick={() => {
                                                    navigate(sellEntryHref)
                                                    setMobileMenuOpen(false)
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Đăng tin bán xe
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    )
}
