import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, Copy, Printer } from 'lucide-react'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const orderId = location.state?.orderId
  const bike = location.state?.bike
  const checkoutData = location.state?.checkoutData
  const paymentMethod = location.state?.paymentMethod

  useEffect(() => {
    if (!orderId) {
      navigate(ROUTES.MARKET)
    }
  }, [orderId, navigate])

  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId)
      alert('Mã đơn hàng đã được sao chép')
    }
  }

  if (!orderId || !bike || !checkoutData) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Đang tải...</h1>
        </div>
      </main>
    )
  }

  const paymentMethodLabels: Record<string, string> = {
    credit_card: 'Thẻ tín dụng/ghi nợ',
    bank_transfer: 'Chuyển khoản ngân hàng',
    cod: 'Thanh toán khi nhận hàng',
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Success Message */}
        <div className="mb-8 rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-900">Đặt hàng thành công!</h1>
          <p className="mt-3 text-green-800">
            Cảm ơn bạn đã mua xe đạp tại Market Bike. Đơn hàng của bạn đã được tạo thành công.
          </p>
        </div>

        {/* Order Details */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order ID */}
            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Mã đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-4">
                  <code className="flex-1 font-mono text-sm font-semibold text-slate-900">{orderId}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyOrderId}
                    className="border-slate-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Lưu mã đơn hàng này để theo dõi đơn hàng của bạn.
                </p>
              </CardContent>
            </Card>

            {/* Bike Information */}
            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Thông tin sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <img
                    src={bike.image}
                    alt={bike.title}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{bike.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{bike.brand}</p>
                    <p className="mt-3 text-lg font-bold text-sky-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        bike.price,
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
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
                {checkoutData.notes && (
                  <div>
                    <p className="text-sm text-slate-600">Ghi chú</p>
                    <p className="mt-1 font-medium text-slate-900">{checkoutData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Thông tin thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Phương thức thanh toán</p>
                  <p className="mt-1 font-medium text-slate-900">{paymentMethodLabels[paymentMethod]}</p>
                </div>
                <div className="flex justify-between rounded-xl bg-slate-100 p-4">
                  <span className="font-semibold text-slate-900">Tổng tiền</span>
                  <span className="text-lg font-bold text-sky-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      bike.price,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <aside>
            <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 sticky top-10">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">Các bước tiếp theo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Xác nhận đơn hàng</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Chúng tôi sẽ gửi email xác nhận trong vòng 15 phút.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Chuẩn bị giao hàng</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Người bán sẽ chuẩn bị xe đạp trong 2-3 ngày.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Giao hàng</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Xe đạp sẽ được giao tới địa chỉ của bạn.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Hoàn tất</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Kiểm tra xe và hoàn tất giao dịch.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-4 mt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-600">Hỗ trợ</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Nếu bạn có câu hỏi, hãy liên hệ với chúng tôi qua email hoặc hotline.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Action Buttons */}
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
