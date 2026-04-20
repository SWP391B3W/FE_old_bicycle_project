import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Copy, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { getPaymentMethodLabel } from '@/lib/order-display'
import type { CheckoutFormData, Order } from '@/types/order'
import type { Product } from '@/types/product'

interface OrderConfirmationState {
  order?: Order
  product?: Product
  checkoutData?: CheckoutFormData
}

const SHIPPING_FEE_PENDING_LABEL = 'Đang tính toán...'

function toImageUrl(image: string | { url: string }) {
  return typeof image === 'string' ? image : image.url
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export default function OrderConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = (location.state ?? {}) as OrderConfirmationState
  const order = locationState.order
  const product = locationState.product
  const checkoutData = locationState.checkoutData

  useEffect(() => {
    if (!order?.id) {
      navigate(ROUTES.MARKET, { replace: true })
    }
  }, [navigate, order?.id])

  const handleCopyOrderId = () => {
    if (order?.id) {
      void navigator.clipboard.writeText(order.id)
      alert('Mã đơn hàng đã được sao chép')
    }
  }

  if (!order || !product || !checkoutData) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Đang tải...</h1>
        </div>
      </main>
    )
  }

  const productImage = getProductImage(product)

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-900">Tạo đơn mua thành công</h1>
          <p className="mt-3 text-green-800">
            Yêu cầu mua đã được gửi vào hệ thống. Người bán cần duyệt trước khi bước thanh toán online được mở.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Mã đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-4">
                  <code className="flex-1 font-mono text-sm font-semibold text-slate-900">{order.id}</code>
                  <Button variant="outline" size="sm" onClick={handleCopyOrderId} className="border-slate-300">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Bạn có thể theo dõi đơn này trong mục đơn mua sau khi người bán phản hồi.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Thông tin sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {productImage ? (
                    <img src={productImage} alt={product.title} className="h-24 w-24 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-200 text-xs text-slate-500">
                      No image
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{product.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{product.brandName ?? product.brand ?? 'Chưa cập nhật'}</p>
                    <p className="mt-3 text-lg font-bold text-sky-600">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Tên người nhận</p>
                  <p className="mt-1 font-medium text-slate-900">{checkoutData.deliveryName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Số điện thoại</p>
                  <p className="mt-1 font-medium text-slate-900">{checkoutData.deliveryPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Địa chỉ giao hàng</p>
                  <p className="mt-1 font-medium text-slate-900">{checkoutData.deliveryAddress}</p>
                </div>
                {checkoutData.notes ? (
                  <div>
                    <p className="text-sm text-slate-600">Ghi chú</p>
                    <p className="mt-1 font-medium text-slate-900">{checkoutData.notes}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Thông tin thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Phương thức thanh toán</p>
                  <p className="mt-1 font-medium text-slate-900">{getPaymentMethodLabel(order)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Trạng thái đơn</p>
                  <p className="mt-1 font-medium text-slate-900">{order.status}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Phí vận chuyển</p>
                  <p className="mt-1 font-medium text-slate-900">{SHIPPING_FEE_PENDING_LABEL}</p>
                </div>
                <div className="flex justify-between rounded-xl bg-slate-100 p-4">
                  <span className="font-semibold text-slate-900">Tổng thanh toán qua SePay</span>
                  <span className="text-lg font-bold text-sky-600">{SHIPPING_FEE_PENDING_LABEL}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside>
            <Card className="sticky top-10 border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Các bước tiếp theo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Chờ người bán duyệt đơn</p>
                    <p className="mt-1 text-sm text-slate-600">Đơn vừa tạo đang ở trạng thái chờ người bán xem xét.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Buyer thanh toán online</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Sau khi người bán duyệt đơn, hệ thống sẽ mở bước tạo QR SePay và cập nhật tổng thanh toán gồm giá xe
                      cùng phí vận chuyển.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Theo dõi giao hàng và xác nhận</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Người bán sẽ tải bằng chứng gửi hàng. Buyer có 5 ngày để test xe trước khi đơn tự hoàn tất.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1 bg-sky-600 text-white hover:bg-sky-500">
            <Link to={ROUTES.HOME}>Về trang chủ</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-slate-300">
            <Link to={ROUTES.MARKET}>Tiếp tục mua sắm</Link>
          </Button>
          <Button variant="outline" className="border-slate-300" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            In đơn hàng
          </Button>
        </div>
      </div>
    </main>
  )
}
