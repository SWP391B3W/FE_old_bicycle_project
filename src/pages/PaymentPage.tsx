import { useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import type { PaymentFormData, PaymentMethod, CheckoutFormData } from '@/types/order'
import { bikes } from '@/data/bikes'
import { CreditCard, DollarSign, Truck } from 'lucide-react'

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const checkoutData = location.state?.checkoutData as CheckoutFormData | undefined
  const bike = location.state?.bike || bikes.find((b) => b.id === id)

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit_card')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: 'credit_card',
  })

  if (!bike || !checkoutData) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Dữ liệu không hợp lệ</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Vui lòng quay lại và thử lại.
          </p>
          <Button asChild className="mt-6 bg-sky-600 text-white hover:bg-sky-500">
            <Link to={ROUTES.MARKET}>Quay lại thị trường</Link>
          </Button>
        </div>
      </main>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setFormData((prev) => ({ ...prev, paymentMethod: method }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate based on payment method
    if (selectedMethod === 'credit_card') {
      if (!formData.cardholderName || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        alert('Vui lòng điền đầy đủ thông tin thẻ')
        return
      }
    }

    setIsLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      navigate('/xac-nhan-don-hang', {
        state: {
          orderId: `ORD-${Date.now()}`,
          bike,
          checkoutData,
          paymentMethod: selectedMethod,
        },
      })
      setIsLoading(false)
    }, 1500)
  }

  const paymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard; description: string }[] = [
    {
      id: 'credit_card',
      label: 'Thẻ tín dụng/ghi nợ',
      icon: CreditCard,
      description: 'Thanh toán bằng thẻ Visa, Mastercard, JCB',
    },
    {
      id: 'bank_transfer',
      label: 'Chuyển khoản ngân hàng',
      icon: DollarSign,
      description: 'Chuyển tiền trực tiếp từ tài khoản ngân hàng của bạn',
    },
    {
      id: 'cod',
      label: 'Thanh toán khi nhận hàng',
      icon: Truck,
      description: 'Thanh toán khi nhận xe đạp (COD)',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            to={`/thanh-toan-don-hang/${bike.id}`}
            className="text-sm font-medium text-sky-600 hover:text-sky-500"
          >
            ← Quay lại thanh toán
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Payment Methods */}
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
                            className={`h-5 w-5 mt-1 flex-shrink-0 ${
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

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-6 border-t border-slate-200/80 pt-8">
                {selectedMethod === 'credit_card' && (
                  <>
                    <div>
                      <Label htmlFor="cardholderName" className="text-sm font-medium text-slate-900">
                        Tên chủ thẻ *
                      </Label>
                      <Input
                        id="cardholderName"
                        name="cardholderName"
                        type="text"
                        value={formData.cardholderName || ''}
                        onChange={handleInputChange}
                        placeholder="Nhập tên chủ thẻ"
                        className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardNumber" className="text-sm font-medium text-slate-900">
                        Số thẻ *
                      </Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        value={formData.cardNumber || ''}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="expiryDate" className="text-sm font-medium text-slate-900">
                          Hạn sử dụng *
                        </Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          value={formData.expiryDate || ''}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm font-medium text-slate-900">
                          CVV *
                        </Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          type="text"
                          value={formData.cvv || ''}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={3}
                          className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedMethod === 'bank_transfer' && (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <p className="text-sm font-medium text-sky-900">Thông tin chuyển khoản</p>
                    <p className="mt-2 text-sm text-sky-800">
                      Sau khi hoàn tất đơn hàng, bạn sẽ nhận được thông tin tài khoản ngân hàng để chuyển khoản.
                    </p>
                  </div>
                )}

                {selectedMethod === 'cod' && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-900">Thanh toán khi nhận hàng</p>
                    <p className="mt-2 text-sm text-green-800">
                      Bạn sẽ thanh toán khi người giao hàng đến giao xe đạp cho bạn.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {isLoading ? 'Đang xử lý...' : `Xác nhận thanh toán`}
                </Button>
              </form>
            </div>
          </section>

          {/* Order Summary */}
          <aside className="space-y-6">
            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bike Info */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
                  <div className="flex gap-4">
                    <img
                      src={bike.images[0]}
                      alt={bike.title}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">{bike.title}</h3>
                      <p className="mt-1 text-xs text-slate-600">{bike.brand}</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          bike.price,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-3 border-t border-slate-200/80 pt-4">
                  <h4 className="font-medium text-slate-900">Thông tin giao hàng</h4>
                  <div className="rounded-xl bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-900">{checkoutData.deliveryName}</p>
                    <p className="mt-1 text-slate-600">{checkoutData.deliveryPhone}</p>
                    <p className="mt-1 text-slate-600">{checkoutData.deliveryAddress}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-slate-200/80 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Giá sản phẩm</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        bike.price,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Phí giao hàng</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Phí dịch vụ</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-slate-200/80 pt-4">
                  <div className="flex justify-between rounded-xl bg-sky-50 p-4">
                    <span className="font-semibold text-slate-900">Tổng cộng</span>
                    <span className="text-lg font-bold text-sky-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        bike.price,
                      )}
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
