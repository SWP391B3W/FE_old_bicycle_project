import { Camera, Shield } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { AuthUser } from '@/types/auth'

interface ProfileHeroProps {
  user: AuthUser
}

export function ProfileHero({ user }: Readonly<ProfileHeroProps>) {
  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email

  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={user.avatar ?? user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-2xl">{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full border bg-background shadow-sm"
              disabled
              title="Tính năng cập nhật ảnh đại diện sẽ sớm có"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              {user.verified ? (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Đã xác thực
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-white/80">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}