import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productsApi } from '@/api/products.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import type { AppRole } from '@/types/auth'
import type { CheckoutFormData } from '@/types/order'
import type { Product } from '@/types/product'

function toImageUrl(image: string | { url: string }) {
  return typeof image === 'string' ? image : image.url
}

function getConditionLabel(condition?: string | null) {
  switch (condition) {
    case 'new':
    case 'new_90':
      return 'Như mới (90%+)'
    case 'used':
      return 'Đã qua sử dụng'
    case 'need_repair':
    case 'needs_repair':
      return 'Cần sửa chữa'
    default:
      return 'Chưa cập nhật'
  }
}

function getRoleRedirectEntry(role?: AppRole | null) {
  switch (role) {
    case 'seller':
      return { href: ROUTES.SELLER, label: 'Về kênh người bán' }
    case 'inspector':
      return { href: ROUTES.INSPECTOR, label: 'Về kênh kiểm định' }
    case 'admin':
      return { href: ROUTES.ADMIN, label: 'Về trang quản trị' }
    default:
      return { href: ROUTES.MARKET, label: 'Quay lại thị trường' }
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function getProductImage(product: Product) {
  const images = product.images ?? []
  for (const image of images) {
    if (typeof image !== 'string' && image.isPrimary) {
      return image.url
    }
  }

  const fallbackImage = images[0]
  return fallbackImage ? toImageUrl(fallbackImage) : ''
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [isProductLoading, setIsProductLoading] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CheckoutFormData>({
    deliveryName: user?.name || '',
    deliveryPhone: user?.phone || '',
    deliveryAddress: user?.defaultAddress || user?.address || '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData((currentValue) => ({
      ...currentValue,
      deliveryName: currentValue.deliveryName || user?.name || '',
      deliveryPhone: currentValue.deliveryPhone || user?.phone || '',
      deliveryAddress: currentValue.deliveryAddress || user?.defaultAddress || user?.address || '',
    }))
  }, [user?.address, user?.defaultAddress, user?.name, user?.phone])

  useEffect(() => {
    if (!id) {
      setProduct(null)
      setProductError('Không tìm thấy mã sản phẩm hợp lệ.')
      setIsProductLoading(false)
      return
    }

    let ignore = false

    const productId = id

    async function loadProduct() {
      setIsProductLoading(true)
      setProductError(null)

      try {
        const result = await productsApi.getById(productId)

        if (!ignore) {
          setProduct(result)
        }
      } catch {
        if (!ignore) {
          setProduct(null)
          setProductError('Không thể tải thông tin xe từ API. Vui lòng thử lại.')
        }
      } finally {
        if (!ignore) {
          setIsProductLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      ignore = true
    }
  }, [id])

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Yêu cầu đăng nhập</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Vui lòng đăng nhập để tiếp tục khi mua xe đạp.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
            </Button>
            <Button asChild className="flex-1 bg-sky-600 text-white hover:bg-sky-500">
              <Link to={ROUTES.REGISTER}>Đăng ký</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (user?.role !== 'buyer') {
    const redirectEntry = getRoleRedirectEntry(user?.role)

    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Chỉ tài khoản người mua mới được đặt hàng</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Luồng thanh toán đang dành riêng cho người mua. Tài khoản hiện tại của bạn nên dùng khu vực chức năng tương ứng thay vì tạo đơn mua.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link to={ROUTES.MARKET}>Xem xe đang bán</Link>
            </Button>
            <Button asChild className="flex-1 bg-sky-600 text-white hover:bg-sky-500">
              <Link to={redirectEntry.href}>{redirectEntry.label}</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (isProductLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Đang tải thông tin xe</h1>
        </div>
      </main>
    )
  }

  if (!product || productError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Xe không tồn tại</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {productError ?? 'Xe bạn đang tìm kiếm không còn khả dụng.'}
          </p>
          <Button asChild className="mt-6 bg-sky-600 text-white hover:bg-sky-500">
            <Link to={ROUTES.MARKET}>Quay lại thị trường</Link>
          </Button>
        </div>
      </main>
    )
  }

  const productImage = getProductImage(product)
  const productBrand = product.brandName ?? product.brand ?? 'Chưa cập nhật'

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((currentValue) => ({ ...currentValue, [name]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.deliveryName || !formData.deliveryPhone || !formData.deliveryAddress) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    setIsSubmitting(true)
    navigate(`/thanh-toan/${product.id}`, {
      state: { checkoutData: formData, product },
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link to={`/bikes/${product.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-500">
            ← Quay lại chi tiết sản phẩm
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
              <h1 className="text-2xl font-semibold text-slate-950">Thông tin giao hàng</h1>
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <Label htmlFor="deliveryName" className="text-sm font-medium text-slate-900">
                    Họ và tên *
                  </Label>
                  <Input
                    id="deliveryName"
                    name="deliveryName"
                    type="text"
                    value={formData.deliveryName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryPhone" className="text-sm font-medium text-slate-900">
                    Số điện thoại *
                  </Label>
                  <Input
                    id="deliveryPhone"
                    name="deliveryPhone"
                    type="tel"
                    value={formData.deliveryPhone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryAddress" className="text-sm font-medium text-slate-900">
                    Địa chỉ giao hàng *
                  </Label>
                  <Textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ giao hàng"
                    className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-900">
                    Ghi chú
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm cho người bán"
                    className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang chuyển sang bước thanh toán...' : 'Tiếp tục thanh toán'}
                </Button>
              </form>
            </div>
          </section>

          <aside className="space-y-6">
            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
                  <div className="flex gap-4">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.title}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-200 text-xs text-slate-500">
                        No image
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">{product.title}</h3>
                      <p className="mt-1 text-xs text-slate-600">{productBrand}</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-200/80 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Giá sản phẩm</span>
                    <span className="font-medium text-slate-900">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Phí giao hàng</span>
                    <span className="font-medium text-slate-900">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Phí dịch vụ</span>
                    <span className="font-medium text-slate-900">{formatCurrency(0)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-4">
                  <div className="flex justify-between rounded-xl bg-sky-50 p-4">
                    <span className="font-semibold text-slate-900">Tổng cộng</span>
                    <span className="text-lg font-bold text-sky-600">{formatCurrency(product.price)}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200/80 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tình trạng</span>
                    <span className="font-medium text-slate-900">{getConditionLabel(product.condition)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Kích thước bánh</span>
                    <span className="font-medium text-slate-900">{product.wheelSize ?? 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Địa điểm</span>
                    <span className="font-medium text-slate-900">
                      {[product.district, product.province].filter(Boolean).join(', ') || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
