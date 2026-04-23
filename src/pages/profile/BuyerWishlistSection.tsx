import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Loader2, Package, Trash2 } from 'lucide-react'
import { wishlistApi, type WishlistItem } from '@/api/wishlist.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildRoute } from '@/constants/routes'
import { formatPriceDisplay } from '@/lib/currency-input'

export function BuyerWishlistSection() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchWishlist = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await wishlistApi.getWishlist()
      setItems(data)
    } catch (err) {
      setError('Không thể tải danh sách yêu thích. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchWishlist()
  }, [])

  const handleRemove = async (productId: string) => {
    setActionLoading(productId)
    try {
      await wishlistApi.removeFromWishlist(productId)
      setItems((current) => current.filter((item) => item.productId !== productId))
    } catch (err) {
      console.error('Failed to remove from wishlist:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-xl font-bold">Yêu thích</CardTitle>
        <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
          {items.length} tin đăng
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
            <Button variant="link" className="ml-2 h-auto p-0" onClick={() => void fetchWishlist()}>
              Thử lại
            </Button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-100 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-medium text-slate-900">Danh mục yêu thích còn trống</h3>
            <p className="mt-1 text-sm text-slate-500">Bạn chưa lưu chiếc xe nào.</p>
            <Button asChild className="mt-6 h-9 px-4 text-xs" variant="outline">
              <Link to="/mua-xe">Khám phá ngay</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white transition-all hover:border-slate-200 hover:shadow-sm"
              >
                <Link to={buildRoute.bikeDetail(item.productId)} className="block aspect-[16/10] overflow-hidden bg-slate-50">
                  {item.primaryImageUrl ? (
                    <img
                      src={item.primaryImageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={buildRoute.bikeDetail(item.productId)} className="flex-1">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-950 hover:text-sky-600 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500"
                      disabled={actionLoading === item.productId}
                      onClick={() => void handleRemove(item.productId)}
                    >
                      {actionLoading === item.productId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  <p className="mt-1 font-bold text-slate-950">{formatPriceDisplay(item.price)}</p>
                  
                  <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className="text-[10px] text-slate-400">Bởi: {item.sellerName}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.status === 'active' ? 'Đang bán' : item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
