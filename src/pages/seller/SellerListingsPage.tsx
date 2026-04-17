import { useCallback, useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Package,
  PenSquare,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { productsApi } from '@/api/products.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES, buildRoute } from '@/constants/routes'
import { formatPriceDisplay } from '@/lib/currency-input'
import { getProductTimelineEntries } from '@/lib/product-visibility'
import type { Product } from '@/types/product'
import { getSellerListingStatusPresentation } from './seller-listing-visibility'

const PAGE_SIZE = 10

function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(dateStr))
}

export default function SellerListingsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await productsApi.getMine(page, PAGE_SIZE)
      setProducts(result.content)
      setTotalPages(result.totalPages)
    } catch {
      setError('Không thể tải danh sách tin đăng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const handleHide = async (productId: string) => {
    setActionLoading(productId)
    try {
      await productsApi.hide(productId)
      await fetchProducts()
    } finally {
      setActionLoading(null)
    }
  }

  const handleShow = async (productId: string) => {
    setActionLoading(productId)
    try {
      await productsApi.show(productId)
      await fetchProducts()
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (productId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tin "${title}"? Hành động này không thể hoàn tác.`)) {
      return
    }

    setActionLoading(productId)
    try {
      await productsApi.delete(productId)
      await fetchProducts()
    } finally {
      setActionLoading(null)
    }
  }

  const filteredProducts = searchQuery
    ? products.filter((product) => {
        const normalizedQuery = searchQuery.toLowerCase()
        return (
          product.title.toLowerCase().includes(normalizedQuery) ||
          product.id.toLowerCase().includes(normalizedQuery)
        )
      })
    : products

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý tin đăng</h2>
          <p className="text-muted-foreground">
            Mọi tin đăng đều phải qua admin và inspection trước khi hiển thị công khai.
          </p>
        </div>
        <Link to={ROUTES.SELLER_NEW_PRODUCT}>
          <Button className="w-full gap-2 sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            Đăng tin mới
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo tên xe..."
            className="bg-background pl-8"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <Button variant="ghost" size="sm" onClick={() => void fetchProducts()}>
            Thử lại
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Sản phẩm
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Giá
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Trạng thái
                </th>
                <th className="hidden h-12 px-4 text-left align-middle font-medium text-muted-foreground md:table-cell">
                  Ngày đăng
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="p-4">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    {searchQuery ? 'Không tìm thấy tin đăng phù hợp.' : 'Bạn chưa có tin đăng nào.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isActing = actionLoading === product.id
                  const canEdit = product.status !== 'sold' && !product.sellerActionLocked
                  const canDelete =
                    product.status !== 'sold' &&
                    product.status !== 'pending_inspection' &&
                    !product.sellerActionLocked
                  const statusPresentation = getSellerListingStatusPresentation(product)
                  const canHide =
                    (product.status === 'active' || product.status === 'inspected_passed') &&
                    statusPresentation.isPubliclyVisible &&
                    !product.sellerActionLocked
                  const canShow = product.status === 'hidden' && !product.sellerActionLocked
                  const timelineEntries = getProductTimelineEntries(product)

                  return (
                    <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.title}
                              className="h-10 w-10 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-secondary/50">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 font-medium text-foreground">{product.title}</p>
                            <p className="truncate text-xs text-muted-foreground">#{product.id.slice(0, 8)}</p>
                            {timelineEntries.map((entry) => (
                              <p
                                key={`${product.id}-${entry.label}`}
                                className={`mt-1 text-xs ${
                                  entry.tone === 'warning'
                                    ? 'text-amber-700 dark:text-amber-300'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                <span className="font-medium">{entry.label}:</span> {entry.value}
                              </p>
                            ))}
                            {statusPresentation.hint && (
                              <p className="mt-1 text-xs text-muted-foreground">{statusPresentation.hint}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle font-medium">
                        {formatPrice(product.price)}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPresentation.className}`}
                        >
                          {statusPresentation.label}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap p-4 align-middle text-muted-foreground md:table-cell">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex justify-end gap-1">
                          {isActing ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              {canEdit && (
                                <Link to={buildRoute.sellerEditProduct(product.id)}>
                                  <Button variant="ghost" size="icon" title="Chỉnh sửa">
                                    <PenSquare className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {canHide && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Ẩn tin"
                                  onClick={() => void handleHide(product.id)}
                                >
                                  <EyeOff className="h-4 w-4" />
                                </Button>
                              )}
                              {canShow && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Hiện lại"
                                  onClick={() => void handleShow(product.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Xóa tin"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => void handleDelete(product.id, product.title)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Trước
          </Button>
          <span className="px-4 text-sm text-muted-foreground">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
            disabled={page >= totalPages - 1 || isLoading}
          >
            Tiếp
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
