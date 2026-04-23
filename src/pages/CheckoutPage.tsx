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
import { shippingApi, type GhnProvince, type GhnDistrict, type GhnWard } from '@/api/shipping.api'
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

  // GHN Selection States
  const [provinces, setProvinces] = useState<GhnProvince[]>([])
  const [districts, setDistricts] = useState<GhnDistrict[]>([])
  const [wards, setWards] = useState<GhnWard[]>([])

  const [provinceId, setProvinceId] = useState<number | ''>('')
  const [districtId, setDistrictId] = useState<number | ''>('')
  const [wardCode, setWardCode] = useState<string>('')
  const [specificAddress, setSpecificAddress] = useState('')
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [isCalculatingFee, setIsCalculatingFee] = useState(false)
  const [originDistrictId, setOriginDistrictId] = useState<number | null>(null)
  const [originWardCode, setOriginWardCode] = useState<string | null>(null)

  // Resolve Product Origin Location
  useEffect(() => {
    if (!product || provinces.length === 0) return

    const resolveOrigin = async () => {
      try {
        // 1. Find Province
        const targetProvince = provinces.find(p => 
          p.ProvinceName.toLowerCase().includes(product.province?.toLowerCase() || '')
        )
        if (!targetProvince) return

        // 2. Fetch Districts for that Province
        const districtList = await shippingApi.getDistricts(targetProvince.ProvinceID)
        
        // 3. Find District
        const targetDistrict = districtList.find(d => 
          d.DistrictName.toLowerCase().includes(product.district?.toLowerCase() || '')
        )
        
        if (targetDistrict) {
          setOriginDistrictId(targetDistrict.DistrictID)
          
          // 4. Fetch Wards for the District to get a valid starting Ward (required by GHN if shop address is missing)
          const wardList = await shippingApi.getWards(targetDistrict.DistrictID)
          if (wardList.length > 0) {
            setOriginWardCode(wardList[0].WardCode)
          }
        }
      } catch (err) {
        console.error('Failed to resolve origin location:', err)
      }
    }

    resolveOrigin()
  }, [product, provinces])

  // Load Provinces
  useEffect(() => {
    shippingApi.getProvinces().then(setProvinces).catch(console.error)
  }, [])

  // Load Districts when Province changes
  useEffect(() => {
    setDistrictId('')
    setWardCode('')
    setDistricts([])
    setWards([])
    setShippingFee(0)
    if (provinceId) {
      shippingApi.getDistricts(Number(provinceId)).then(setDistricts).catch(console.error)
    }
  }, [provinceId])

  // Load Wards when District changes
  useEffect(() => {
    setWardCode('')
    setWards([])
    setShippingFee(0)
    if (districtId) {
      shippingApi.getWards(Number(districtId)).then(setWards).catch(console.error)
    }
  }, [districtId])

  // Calculate Shipping Fee when Ward changes
  useEffect(() => {
    if (districtId && wardCode) {
      setIsCalculatingFee(true)
      shippingApi.calculateFee({
        from_district_id: originDistrictId || undefined,
        from_ward_code: originWardCode || undefined,
        to_district_id: Number(districtId),
        to_ward_code: String(wardCode),
        weight: 15000 // 15kg hardcoded for bicycles
      })
        .then(res => {
          if (res && res.total) {
            setShippingFee(res.total)
          }
        })
        .catch(console.error)
        .finally(() => setIsCalculatingFee(false))
    }
  }, [districtId, wardCode])

  // Construct full delivery address
  useEffect(() => {
    const provinceText = provinces.find((p) => p.ProvinceID === Number(provinceId))?.ProvinceName || ''
    const districtText = districts.find((d) => d.DistrictID === Number(districtId))?.DistrictName || ''
    const wardText = wards.find((w) => w.WardCode === wardCode)?.WardName || ''
    const parts = [specificAddress, wardText, districtText, provinceText].filter(Boolean)
    const fullAddress = parts.join(', ')
    setFormData((prev) => ({ ...prev, deliveryAddress: fullAddress }))
  }, [provinceId, districtId, wardCode, specificAddress, provinces, districts, wards])

  useEffect(() => {
    setFormData((currentValue) => ({
      ...currentValue,
      deliveryName: currentValue.deliveryName || user?.name || '',
      deliveryPhone: currentValue.deliveryPhone || user?.phone || '',
    }))
  }, [user?.name, user?.phone])

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
      state: { checkoutData: formData, product, shippingFee },
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

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-900">Địa chỉ giao hàng (GHN) *</Label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={provinceId}
                      onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : '')}
                      required
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map((p) => (
                        <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                      ))}
                    </select>

                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : '')}
                      disabled={!provinceId}
                      required
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((d) => (
                        <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                      ))}
                    </select>

                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={wardCode}
                      onChange={(e) => setWardCode(e.target.value)}
                      disabled={!districtId}
                      required
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((w) => (
                        <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                      ))}
                    </select>
                  </div>

                  <Textarea
                    id="specificAddress"
                    name="specificAddress"
                    value={specificAddress}
                    onChange={(e) => setSpecificAddress(e.target.value)}
                    placeholder="Số nhà, Tên đường (Ví dụ: 123 Đường Nguyễn Văn Cừ)"
                    className="mt-2 border-slate-300 bg-slate-50 focus:border-sky-400 focus:ring-sky-400/30"
                    rows={2}
                    required
                  />
                  {formData.deliveryAddress && specificAddress && (
                    <p className="text-sm text-slate-500">
                      <strong>Địa chỉ đầy đủ: </strong> {formData.deliveryAddress}
                    </p>
                  )}
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
                    <span className="text-slate-600">Phí giao hàng (GHN)</span>
                    <span className="font-medium text-slate-900 text-right">
                      {isCalculatingFee ? <span className="text-slate-400">Đang tính...</span> : (shippingFee > 0 ? formatCurrency(shippingFee) : '0 ₫')}
                      <br />
                      <span className="text-xs text-amber-600">(Thanh toán cho shipper khi nhận xe)</span>
                    </span>
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
