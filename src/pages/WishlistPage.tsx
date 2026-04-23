import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Loader2, Package, Trash2 } from 'lucide-react'
import { wishlistApi, type WishlistItem } from '@/api/wishlist.api'
import { Button } from '@/components/ui/button'
import { buildRoute } from '@/constants/routes'
import { formatPriceDisplay } from '@/lib/currency-input'

export default function WishlistPage() {
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
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Xe yêu thích</h1>
          <p className="mt-2 text-slate-600">Danh sách các xe bạn đã lưu để theo dõi.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          {items.length} tin đăng
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
          <Button variant="link" className="ml-2 h-auto p-0" onClick={() => void fetchWishlist()}>
            Thử lại
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Heart className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900">Danh mục yêu thích còn trống</h3>
          <p className="mt-2 text-slate-500">Bạn chưa lưu bất kỳ chiếc xe nào.</p>
          <Button asChild className="mt-8 bg-slate-950 text-white hover:bg-slate-800">
            <Link to="/mua-xe">Khám phá thị trường ngay</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-md hover:shadow-slate-200/50"
            >
              <Link to={buildRoute.bikeDetail(item.productId)} className="block aspect-[4/3] overflow-hidden bg-slate-100">
                {item.primaryImageUrl ? (
                  <img
                    src={item.primaryImageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <Package className="h-10 w-10" />
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <Link to={buildRoute.bikeDetail(item.productId)} className="flex-1">
                    <h3 className="line-clamp-1 font-semibold text-slate-950 hover:text-sky-600 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500"
                    disabled={actionLoading === item.productId}
                    onClick={() => void handleRemove(item.productId)}
                  >
                    {actionLoading === item.productId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <p className="mt-2 text-lg font-bold text-slate-950">{formatPriceDisplay(item.price)}</p>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500">Người bán: {item.sellerName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status === 'active' ? 'Đang bán' : item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
