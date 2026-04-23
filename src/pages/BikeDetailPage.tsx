import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Loader2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminProductsApi } from '@/api/admin-products.api'
import { productsApi } from '@/api/products.api'
import { reviewApi, type Review } from '@/api/review.api'
import { ReviewList } from '@/components/reviews/ReviewList'
import { wishlistApi } from '@/api/wishlist.api'
import { Button } from '@/components/ui/button'
import { ROUTES, buildRoute } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessSellerEntry, getSellEntryHref } from '@/layouts/app-header-visibility'
import { formatPriceDisplay } from '@/lib/currency-input'
import { getPrimaryImage, getProductConditionLabel, getProductLocation } from '@/pages/home/home.utils'
import type { Product } from '@/types/product'

function toImageUrl(image: string | { url: string }) {
  return typeof image === 'string' ? image : image.url
}

export default function BikeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuth()
  const [bike, setBike] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState('')

  useEffect(() => {
    if (!bike?.seller?.id) return

    async function loadReviews() {
      setIsReviewsLoading(true)
      try {
        const result = await reviewApi.getSellerReviews(bike!.seller!.id)
        setReviews(result.content || [])
      } catch (err) {
        console.error('Failed to load reviews:', err)
      } finally {
        setIsReviewsLoading(false)
      }
    }

    void loadReviews()
  }, [bike?.seller?.id])

  useEffect(() => {
    if (!id) {
      setBike(null)
      setIsLoading(false)
      return
    }

    const productId = id
    let ignore = false

    async function loadBike() {
      setIsLoading(true)
      setError(null)

      const isAdmin = isAuthenticated && user?.role === 'admin'

      try {
        const result = isAdmin
          ? await adminProductsApi.getById(productId)
          : await productsApi.getById(productId)

        if (!ignore) {
          setBike(result)
        }
      } catch {
        if (!isAdmin) {
          if (!ignore) {
            setBike(null)
            setError('Không thể tải chi tiết tin đăng từ API.')
          }
          return
        }

        try {
          const fallbackResult = await productsApi.getById(productId)

          if (!ignore) {
            setBike(fallbackResult)
          }
        } catch {
          if (!ignore) {
            setBike(null)
            setError('Không thể tải chi tiết tin đăng từ API.')
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadBike()

    return () => {
      ignore = true
    }
  }, [id, isAuthenticated, user?.role])

  useEffect(() => {
    setSelectedImage(bike ? getPrimaryImage(bike) : '')
  }, [bike?.id])

  const bikeImages = useMemo(
    () => (bike?.images ?? []).map((image) => toImageUrl(image)),
    [bike?.images],
  )

  const currentImage = bikeImages.includes(selectedImage) ? selectedImage : bikeImages[0] ?? ''
  const conditionLabel = getProductConditionLabel(bike?.condition) ?? 'Chưa cập nhật'
  const locationLabel = bike ? getProductLocation(bike) : 'Chưa cập nhật'
  const isBuyer = user?.role === 'buyer' || !isAuthenticated
  const isSeller = user?.role === 'seller'
  const showSellerButton = canAccessSellerEntry(user?.role, isAuthenticated)
  const sellerActionHref = getSellEntryHref(user?.role, isAuthenticated)
  const sellerName =
    bike?.seller
      ? `${bike.seller.firstName} ${bike.seller.lastName}`.trim() || bike.seller.phone || 'Người bán'
      : 'Người bán'

  function handlePreviousImage() {
    if (bikeImages.length < 2) {
      return
    }

    const currentIndex = bikeImages.indexOf(currentImage)
    const safeIndex = currentIndex >= 0 ? currentIndex : 0
    const previousIndex = (safeIndex - 1 + bikeImages.length) % bikeImages.length
    setSelectedImage(bikeImages[previousIndex])
  }

  function handleNextImage() {
    if (bikeImages.length < 2) {
      return
    }

    const currentIndex = bikeImages.indexOf(currentImage)
    const safeIndex = currentIndex >= 0 ? currentIndex : 0
    const nextIndex = (safeIndex + 1) % bikeImages.length
    setSelectedImage(bikeImages[nextIndex])
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </main>
    )
  }

  if (!bike) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Tin đăng không tồn tại</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {error ?? 'Bạn có thể quay lại trang thị trường để chọn tin đăng khác.'}
          </p>
          <Button asChild className="mt-6 bg-slate-950 text-white hover:bg-slate-800">
            <Link to={ROUTES.MARKET}>Quay lại thị trường</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <section className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                {bike.categoryName ?? bike.category ?? 'Xe đạp'}
              </span>
              <Link to={ROUTES.MARKET} className="text-sm font-medium text-sky-600 hover:text-sky-500">
                ← Quay lại thị trường
              </Link>
            </div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{bike.title}</h1>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50",
                    bike.isFavorite ? "text-red-500 hover:text-red-600" : "text-slate-400 hover:text-slate-600"
                  )}
                  onClick={async () => {
                    if (!bike) return
                    try {
                      if (bike.isFavorite) {
                        await wishlistApi.removeFromWishlist(bike.id)
                        setBike({ ...bike, isFavorite: false })
                      } else {
                        await wishlistApi.addToWishlist(bike.id)
                        setBike({ ...bike, isFavorite: true })
                      }
                    } catch (err) {
                      console.error('Failed to update wishlist:', err)
                    }
                  }}
                >
                  <Heart className={cn("h-6 w-6", bike.isFavorite && "fill-current")} />
                </Button>
              )}
            </div>
            <p className="text-sm text-slate-600">
              {locationLabel}
              {bike.createdAt
                ? ` • ${new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(bike.createdAt))}`
                : ''}
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.9fr_0.85fr]">
            <div className="space-y-4">
              <div className="relative h-[520px] overflow-hidden rounded-3xl bg-slate-100">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={bike.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Chưa có ảnh sản phẩm
                  </div>
                )}

                {bikeImages.length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label="Ảnh trước"
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Ảnh tiếp theo"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>

              {bikeImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {bikeImages.map((image, index) => (
                    <button
                      key={`${bike.id}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-2xl border-2 transition ${
                        currentImage === image
                          ? 'border-black'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${bike.title} - góc chụp ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">Giá</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {formatPriceDisplay(bike.price)}
                </p>
              </div>
              <div className="grid gap-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5">
                  <p className="font-medium text-slate-900">Tình trạng</p>
                  <p className="mt-1">{conditionLabel}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5">
                  <p className="font-medium text-slate-900">Kích thước</p>
                  <p className="mt-1">{bike.wheelSize ?? bike.frameSize ?? 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="space-y-3">
                {isBuyer ? (
                  bike.currentUserHasPendingOrder ? (
                    <div className="space-y-2">
                      <Button disabled className="h-11 w-full bg-slate-200 text-slate-500 cursor-not-allowed">
                        Đã gửi yêu cầu mua
                      </Button>
                      <p className="text-center text-xs text-amber-600">
                        Bạn đã có một yêu cầu mua đang chờ xử lý cho chiếc xe này.
                      </p>
                    </div>
                  ) : (
                    <Button asChild className="h-11 w-full bg-sky-600 text-white hover:bg-sky-500">
                      <Link to={buildRoute.checkout(bike.id)}>Mua ngay</Link>
                    </Button>
                  )
                ) : null}
                {showSellerButton ? (
                  <Button
                    asChild
                    variant={isSeller ? 'default' : 'outline'}
                    className="h-11 w-full border-slate-300"
                  >
                    <Link to={sellerActionHref}>
                      {isSeller ? 'Đăng tin bán xe' : 'Trở thành người bán'}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <article className="rounded-3xl border border-slate-200/80 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-950">Mô tả sản phẩm</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{bike.description || 'Chưa có mô tả.'}</p>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-950">Thông tin cơ bản</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Thương hiệu</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {bike.brandName ?? bike.brand ?? 'Chưa cập nhật'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Loại xe</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {bike.categoryName ?? bike.category ?? 'Chưa cập nhật'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Năm đăng</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {bike.createdAt
                    ? new Intl.DateTimeFormat('vi-VN', { year: 'numeric' }).format(
                        new Date(bike.createdAt),
                      )
                    : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Địa điểm</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{locationLabel}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-950">Thông tin người bán</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Người đăng</p>
                <Link 
                  to={buildRoute.publicProfile(bike.seller!.id)} 
                  className="mt-2 block text-lg font-semibold text-sky-600 hover:text-sky-500 hover:underline transition-all"
                >
                  {sellerName}
                </Link>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Được đăng từ</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {bike.createdAt
                    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
                        new Date(bike.createdAt),
                      )
                    : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Tình trạng xe</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{conditionLabel}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-slate-950">Đánh giá về người bán</h2>
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {reviews.length} đánh giá
              </span>
            </div>
            <ReviewList reviews={reviews} isLoading={isReviewsLoading} />
          </article>
        </section>
      </div>
    </main>
  )
}
