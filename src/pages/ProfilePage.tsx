import { PayoutProfileSection } from '@/components/profile/PayoutProfileSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileHero } from './profile/ProfileHero'
import { ProfileInfoSection } from './profile/ProfileInfoSection'
import { ProfileSecuritySection } from './profile/ProfileSecuritySection'
import { ProfileSidebar } from './profile/ProfileSidebar'
import { useProfilePage } from './profile/useProfilePage'

interface PlaceholderSectionProps {
  title: string
  description: string
}

function PlaceholderSection({ title, description }: Readonly<PlaceholderSectionProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-muted-foreground">
          {description}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const profilePage = useProfilePage()

  if (!profilePage.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHero user={profilePage.user} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <ProfileSidebar
            activeTab={profilePage.activeTab}
            visibleTabs={profilePage.visibleTabs}
            onTabChange={profilePage.actions.changeTab}
            onLogout={profilePage.actions.logout}
          />

          <div className="flex-1">
            {profilePage.activeTab === 'profile' ? (
              <ProfileInfoSection
                user={profilePage.user}
                formData={profilePage.profileState.formData}
                isEditing={profilePage.profileState.isEditing}
                isLoading={profilePage.profileState.isLoading}
                error={profilePage.profileState.error}
                success={profilePage.profileState.success}
                onStartEditing={profilePage.profileState.startEditing}
                onCancelEditing={profilePage.profileState.cancelEditing}
                onSave={profilePage.profileState.save}
                onFieldChange={profilePage.profileState.updateField}
              />
            ) : null}

            {profilePage.activeTab === 'security' ? (
              <ProfileSecuritySection
                formData={profilePage.securityState.formData}
                isLoading={profilePage.securityState.isLoading}
                error={profilePage.securityState.error}
                success={profilePage.securityState.success}
                onSubmit={profilePage.securityState.submit}
                onFieldChange={profilePage.securityState.updateField}
              />
            ) : null}

            {profilePage.activeTab === 'payout' ? <PayoutProfileSection /> : null}

            {profilePage.activeTab === 'orders' ? (
              <PlaceholderSection
                title="Đơn mua"
                description="Danh sách đơn mua của bạn sẽ hiển thị ở đây trong phiên bản tiếp theo."
              />
            ) : null}

            {profilePage.activeTab === 'listings' ? (
              <PlaceholderSection
                title="Tin đăng"
                description="Danh sách tin đăng sẽ được đồng bộ vào trang profile trong phiên bản tiếp theo."
              />
            ) : null}

            {profilePage.activeTab === 'wishlist' ? (
              <PlaceholderSection
                title="Yêu thích"
                description="Danh sách xe yêu thích của bạn sẽ hiển thị tại đây."
              />
            ) : null}

            {profilePage.activeTab === 'reviews' ? (
              <PlaceholderSection
                title="Đánh giá"
                description="Bạn chưa có đánh giá nào được hiển thị trên hồ sơ."
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}