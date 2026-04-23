import { PayoutProfileSection } from '@/components/profile/PayoutProfileSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileHero } from './profile/ProfileHero'
import { BuyerOrdersSection } from './profile/BuyerOrdersSection'
import { ProfileInfoSection } from './profile/ProfileInfoSection'
import { ProfileSecuritySection } from './profile/ProfileSecuritySection'
import { ProfileSidebar } from './profile/ProfileSidebar'
import { useProfilePage } from './profile/useProfilePage'
import { ReviewList } from '@/components/reviews/ReviewList'
import { SellerListingsSection } from './profile/SellerListingsSection'
import { BuyerWishlistSection } from './profile/BuyerWishlistSection'

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
              <BuyerOrdersSection buyerId={profilePage.user.id} />
            ) : null}

            {profilePage.activeTab === 'listings' ? (
              <SellerListingsSection sellerId={profilePage.user.id} />
            ) : null}

            {profilePage.activeTab === 'wishlist' ? (
              <BuyerWishlistSection />
            ) : null}

            {profilePage.activeTab === 'reviews' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Đánh giá của bạn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList 
                    reviews={profilePage.reviews} 
                    isLoading={profilePage.isReviewsLoading} 
                    mode={profilePage.user.role === 'buyer' ? 'buyer' : 'seller'}
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}