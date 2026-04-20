import { LogOut, Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ProfileTabDefinition } from './profile.constants'
import type { ProfileTabId } from './profile.types'

interface ProfileSidebarProps {
  activeTab: ProfileTabId
  visibleTabs: ProfileTabDefinition[]
  onTabChange: (tab: ProfileTabId) => void
  onLogout: () => void
}

export function ProfileSidebar({ activeTab, visibleTabs, onTabChange, onLogout }: Readonly<ProfileSidebarProps>) {
  return (
    <aside className="shrink-0 lg:w-64">
      <Card>
        <CardContent className="p-2">
          <nav className="space-y-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}

            <Separator className="my-2" />

            <button
              type="button"
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground"
              disabled
            >
              <Settings className="h-4 w-4" />
              Cài đặt nâng cao
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </nav>
        </CardContent>
      </Card>
    </aside>
  )
}