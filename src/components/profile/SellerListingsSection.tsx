import { Eye, EyeOff, Loader2, Package, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES, buildRoute } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { getSellerListingStatusPresentation } from '@/pages/seller/seller-listing-visibility'
import { formatPriceDisplay } from '@/lib/currency-input'

interface SellerListingsSectionProps {
  listings: Product[]
  listingsLoading: boolean
  togglingId: string | null
  onToggleVisibility: (item: Product, action: 'hide' | 'show') => void
  onDeleteListing: (id: string) => void
}

function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

export function SellerListingsSection({
  listings,
  listingsLoading,
  togglingId,
  onToggleVisibility,
  onDeleteListing,
}: SellerListingsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tin đăng của tôi</CardTitle>
        <Button size="sm" asChild>
          <Link to={ROUTES.SELLER_NEW_PRODUCT}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Đăng tin mới
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {listingsLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : listings.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có tin đăng nào.</p>
            <Button asChild variant="outline" className="mt-4" size="sm">
              <Link to={ROUTES.SELLER_NEW_PRODUCT}>Đăng tin đầu tiên</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((item) => {
              const thumb = item.images?.find((image) => image.isPrimary)?.url ?? item.images?.[0]?.url
              const isToggling = togglingId === item.id
              const statusPresentation = getSellerListingStatusPresentation(item)
              const canEdit = item.status !== 'sold' && !item.sellerActionLocked
              const canHide =
                (item.status === 'active' || item.status === 'inspected_passed') &&
                statusPresentation.isPubliclyVisible &&
                !item.sellerActionLocked
              const canShow = item.status === 'hidden' && !item.sellerActionLocked
              const canDelete =
                item.status !== 'sold' &&
                item.status !== 'pending_inspection' &&
                !item.sellerActionLocked

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border p-4 transition-colors hover:border-primary/30"
                >
                  <Link to={buildRoute.bikeDetail(item.id)} className="shrink-0">
                    {thumb ? (
                      <img src={thumb} alt={item.title} className="h-20 w-20 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link to={buildRoute.bikeDetail(item.id)}>
                      <h3 className="line-clamp-1 font-semibold hover:text-primary">{item.title}</h3>
                    </Link>
                    <p className="mt-0.5 font-bold text-primary">{formatPrice(item.price)}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn('border-transparent text-xs', statusPresentation.className)}
                      >
                        {statusPresentation.label}
                      </Badge>
                    </div>
                    {statusPresentation.hint && (
                      <p className="mt-2 text-xs text-muted-foreground">{statusPresentation.hint}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-1.5">
                    {canEdit && (
                      <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs">
                        <Link to={buildRoute.sellerEditProduct(item.id)}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Sửa
                        </Link>
                      </Button>
                    )}

                    {item.status !== 'sold' && (canHide || canShow) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => onToggleVisibility(item, canHide ? 'hide' : 'show')}
                        disabled={isToggling}
                      >
                        {isToggling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : canHide ? (
                          <EyeOff className="mr-1 h-3.5 w-3.5" />
                        ) : (
                          <Eye className="mr-1 h-3.5 w-3.5" />
                        )}
                        {canHide ? 'Ẩn' : 'Hiện'}
                      </Button>
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteListing(item.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
