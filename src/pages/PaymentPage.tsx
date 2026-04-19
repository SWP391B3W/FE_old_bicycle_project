import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { DollarSign, Truck } from 'lucide-react'
import { ordersApi } from '@/api/orders.api'
import { productsApi } from '@/api/products.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import type { CheckoutFormData, PaymentFormData, PaymentMethod } from '@/types/order'
import type { Product } from '@/types/product'

type PaymentMethodOption = 'bank_transfer' | 'cod'

interface PaymentPageState {
  checkoutData?: CheckoutFormData
  product?: Product
}

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

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function normalizePaymentMethod(method: PaymentMethodOption): Extract<PaymentMethod, 'transfer' | 'cash'> {
  return method === 'cod' ? 'cash' : 'transfer'
}

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const locationState = (location.state ?? {}) as PaymentPageState
  const checkoutData = locationState.checkoutData
  const [product, setProduct] = useState<Product | null>(locationState.product ?? null)
  const [isProductLoading, setIsProductLoading] = useState(!locationState.product)
  const [productError, setProductError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption>('bank_transfer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: 'transfer',
  })

  useEffect(() => {
    if (!id || product) {
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
  }, [id, product])

  const productImage = useMemo(() => (product ? getProductImage(product) : ''), [product])
  const productBrand = product?.brandName ?? product?.brand ?? 'Chưa cập nhật'

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Yêu cầu đăng nhập</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Vui lòng đăng nhập bằng tài khoản người mua để tiếp tục thanh toán.
          </p>
          <Button asChild className="mt-6 bg-sky-600 text-white hover:bg-sky-500">
            <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
          </Button>
        </div>
      </main>
    )
  }

  if (user?.role !== 'buyer') {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Chỉ tài khoản người mua mới được thanh toán</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Vui lòng quay lại khu vực phù hợp với vai trò hiện tại của bạn.
          </p>
          <Button asChild className="mt-6 bg-sky-600 text-white hover:bg-sky-500">
            <Link to={ROUTES.MARKET}>Quay lại thị trường</Link>
          </Button>
        </div>
      </main>
    )
  }

  if (!checkoutData) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Thiếu thông tin giao hàng</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Vui lòng quay lại bước trước để nhập đầy đủ thông tin trước khi tạo đơn mua thật.
          </p>
          <Button asChild className="mt-6 bg-sky-600 text-white hover:bg-sky-500">
            <Link to={id ? `/thanh-toan-don-hang/${id}` : ROUTES.MARKET}>Quay lại bước thanh toán</Link>
          </Button>
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
          <h1 className="text-2xl font-semibold text-slate-950">Dữ liệu không hợp lệ</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {productError ?? 'Vui lòng quay lại và thử lại.'}
          </p>
          <Button asChild className="mt-6 bg-sky-600 text-white hover:bg-sky-500">
            <Link to={ROUTES.MARKET}>Quay lại thị trường</Link>
          </Button>
        </div>
      </main>
    )
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((currentValue) => ({ ...currentValue, [name]: value }))
  }

  const handlePaymentMethodChange = (method: PaymentMethodOption) => {
    setSelectedMethod(method)
    setFormData((currentValue) => ({
      ...currentValue,
      paymentMethod: normalizePaymentMethod(method),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const createdOrder = await ordersApi.create({
        productId: product.id,
        paymentMethod: normalizePaymentMethod(selectedMethod),
        paymentOption: 'full',
      })

      navigate(ROUTES.ORDER_CONFIRMATION, {
        state: {
          order: createdOrder,
          product,
          checkoutData,
        },
      })
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Không thể tạo đơn mua lúc này. Vui lòng thử lại.'))
      setIsSubmitting(false)
    }
  }

  const paymentMethods: { id: PaymentMethodOption; label: string; icon: typeof DollarSign; description: string }[] = [
    {
      id: 'bank_transfer',
      label: 'Chuyển khoản ngân hàng',
      icon: DollarSign,
      description: 'Tạo đơn bằng phương thức chuyển khoản (paymentMethod=transfer). Seller duyệt xong buyer chuyển khoản.',
    },
    {
      id: 'cod',
      label: 'Thanh toán trực tiếp',
      icon: Truck,
      description: 'Tạo đơn bằng phương thức tiền mặt (paymentMethod=cash). Hai bên xử lý trực tiếp sau khi seller duyệt.',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            to={`/thanh-toan-don-hang/${product.id}`}
            state={{ checkoutData, product }}
            className="text-sm font-medium text-sky-600 hover:text-sky-500"
          >
            ← Quay lại bước giao hàng
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
              <h1 className="text-2xl font-semibold text-slate-950">Chọn phương thức thanh toán</h1>

              <div className="mt-6 space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon

                  return (
                    <label key={method.id} className="flex cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={() => handlePaymentMethodChange(method.id)}
                        className="sr-only"
                      />
                      <div
                        className={`flex-1 rounded-2xl border-2 p-4 transition ${
                          selectedMethod === method.id
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-slate-200/80 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            className={`mt-1 h-5 w-5 flex-shrink-0 ${
                              selectedMethod === method.id ? 'text-sky-600' : 'text-slate-400'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{method.label}</p>
                            <p className="mt-1 text-sm text-slate-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6 border-t border-slate-200/80 pt-8">
                {selectedMethod === 'bank_transfer' ? (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <p className="text-sm font-medium text-sky-900">Chuyển khoản ngân hàng</p>
                    <p className="mt-2 text-sm text-sky-800">
                      Khi bấm xác nhận, hệ thống sẽ tạo đơn mua bằng `paymentMethod=transfer`. Seller sẽ duyệt đơn trước khi buyer chuyển tiền ở bước tiếp theo.
                    </p>
                  </div>
                ) : null}

                {selectedMethod === 'cod' ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-900">Thanh toán trực tiếp</p>
                    <p className="mt-2 text-sm text-green-800">
                      Hệ thống sẽ tạo đơn mua bằng `paymentMethod=cash`. Sau khi seller duyệt, hai bên xử lý thanh toán trực tiếp.
                    </p>
                  </div>
                ) : null}

                {submitError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {submitError}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo đơn mua...' : 'Xác nhận và tạo đơn mua'}
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
                  <h4 className="font-medium text-slate-900">Thông tin giao hàng</h4>
                  <div className="rounded-xl bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-900">{checkoutData.deliveryName}</p>
                    <p className="mt-1 text-slate-600">{checkoutData.deliveryPhone}</p>
                    <p className="mt-1 text-slate-600">{checkoutData.deliveryAddress}</p>
                    {checkoutData.notes ? <p className="mt-1 text-slate-600">{checkoutData.notes}</p> : null}
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
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
