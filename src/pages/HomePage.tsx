import { useNavigate } from 'react-router-dom'
import { buildRoute } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessSellerEntry, getSellEntryHref } from '@/layouts/app-header-visibility'
import { HomeCategoriesSection } from './home/HomeCategoriesSection'
import { HomeFeaturedProductsSection } from './home/HomeFeaturedProductsSection'
import { HomeHeroSection } from './home/HomeHeroSection'
import { HomeSellerCtaSection } from './home/HomeSellerCtaSection'
import { HomeTrustSection } from './home/HomeTrustSection'
import { useHomePageData } from './home/useHomePageData'

export default function HomePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const {
    searchState,
    searchActions,
    locationState,
    featuredProducts,
    categories,
    featuredLoading,
    categoriesLoading,
  } = useHomePageData()

  function handleSearch() {
    navigate(
      buildRoute.market({
        keyword: searchState.keyword.trim(),
        province: searchState.province,
        district: searchState.district,
        ward: searchState.ward,
      }),
    )
  }

  return (
    <div className="flex flex-col">
      <HomeHeroSection
        searchState={searchState}
        locationState={locationState}
        searchActions={searchActions}
        onSearch={handleSearch}
      />
      <HomeTrustSection />
      <HomeFeaturedProductsSection products={featuredProducts} loading={featuredLoading} />
      <HomeCategoriesSection categories={categories} loading={categoriesLoading} />
      {canAccessSellerEntry(user?.role, isAuthenticated) ? (
        <HomeSellerCtaSection sellerEntryHref={getSellEntryHref(user?.role, isAuthenticated)} />
      ) : null}
    </div>
  )
}
