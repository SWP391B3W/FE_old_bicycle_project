import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { bikes, conditions } from '@/data/bikes'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import type { CheckoutFormData } from '@/types/order'

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const navigator = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const bike = useMemo(() => bikes.find((item) => item.id === id), [id])

  const [formData, setFormData] = useState<CheckoutFormData>({
    deliveryName: user?.name || '',
    deliveryPhone: '',
    deliveryAddress: '',
    notes: '',
  })

  const [isLoading, setIsLoading] = useState(false)

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

  if (!bike) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Xe không tồn tại</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Xe mà bạn đang tìm kiếm không còn khả dụng.
          </p>
          <Button asChild className="mt-6 bg-sky-600 text-white hover:bg-sky-500">
            <Link to={ROUTES.MARKET}>Quay lại thị trường</Link>
          </Button>
        </div>
      </main>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.deliveryName || !formData.deliveryPhone || !formData.deliveryAddress) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Navigate to payment page with checkout data
      navigator(`/thanh-toan/${bike.id}`, {
        state: { checkoutData: formData, bike },
      })
      setIsLoading(false)
    }, 500)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link to={`/bikes/${bike.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-500">
            ← Quay lại chi tiết sản phẩm
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Checkout Form */}
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
              <h1 className="text-2xl font-semibold text-slate-950">Thong tin giao hang</h1>
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
                    placeholder="Nhập địa chỉ giao hàng (số nhà, đường, phường, quận, thành phố)"
                    className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-900">
                    Ghi chú (tùy chỉnh)
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm cho người bán (ví dụ: thời gian giao hàng ưa thích)"
                    className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {isLoading ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
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
                      src={bike.image}
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

                {/* Bike Details */}
                <div className="space-y-2 border-t border-slate-200/80 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tình trạng</span>
                    <span className="font-medium text-slate-900">{conditions[bike.condition]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Năm sản xuất</span>
                    <span className="font-medium text-slate-900">{bike.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Kích thước bánh</span>
                    <span className="font-medium text-slate-900">{bike.wheelSize}</span>
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
