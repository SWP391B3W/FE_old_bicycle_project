// @ts-nocheck
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit2, Eye, EyeOff, Loader2, Package, Plus, Trash2 } from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import type { Product } from '@/types/product'
// @ts-ignore
import { toast } from 'react-hot-toast'

interface SellerListingsSectionProps {
  sellerId: string
}

export function SellerListingsSection({}: SellerListingsSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const result = await productsApi.getMine()
      // Lọc theo sellerId nếu cần (mặc định getMine đã là của chính mình)
      setProducts(result.content)
    } catch (error) {
      console.error('Failed to load listings:', error)
      toast.error('Không thể tải danh sách tin đăng.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleHide(product: Product) {
    setActionLoadingId(product.id)
    try {
      if (product.isHidden) {
        await productsApi.show(product.id)
        toast.success(`Đã hiện tin đăng: ${product.title}`)
      } else {
        await productsApi.hide(product.id)
        toast.success(`Đã ẩn tin đăng: ${product.title}`)
      }
      await loadProducts()
    } catch (error) {
      toast.error('Thực hiện thất bại. Vui lòng thử lại.')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa tin đăng này? Thao tác này không thể hoàn tác.')) {
      return
    }

    setActionLoadingId(productId)
    try {
      await productsApi.delete(productId)
      toast.success('Đã xóa tin đăng thành công.')
      await loadProducts()
    } catch (error) {
      toast.error('Xóa thất bại. Vui lòng thử lại.')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Tin đăng của bạn</CardTitle>
          <Button asChild size="sm" className="gap-2">
            <Link to={ROUTES.SELL}>
              <Plus className="h-4 w-4" />
              Đăng tin mới
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải danh sách tin đăng...
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
              <p className="text-base font-medium text-foreground">Bạn chưa có tin đăng nào.</p>
              <p className="mt-2 text-sm text-muted-foreground">Hãy bắt đầu bán chiếc xe của bạn ngay hôm nay!</p>
              <Button className="mt-4" asChild>
                <Link to={ROUTES.SELL}>Đăng bán xe</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {product.images?.[0] ? (
                      <img 
                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} 
                        alt={product.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">{product.title}</h3>
                      {product.isHidden && (
                        <Badge variant="secondary" className="text-[10px] uppercase">Đang ẩn</Badge>
                      )}
                    </div>
                    <div className="text-sm font-bold text-primary">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Loại: {product.categoryName}</span>
                      <span>•</span>
                      <span>Hãng: {product.brandName}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={ROUTES.BIKE_DETAIL.replace(':productId', product.id)}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link to={ROUTES.SELLER_EDIT_PRODUCT.replace(':productId', product.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleHide(product)}
                      disabled={actionLoadingId === product.id}
                    >
                      {actionLoadingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : product.isHidden ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(product.id)}
                      disabled={actionLoadingId === product.id}
                    >
                      {actionLoadingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
