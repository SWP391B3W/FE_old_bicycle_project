import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info, Loader2, Upload, X } from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { referenceDataApi } from '@/api/reference-data.api'
import { AdministrativeLocationFields } from '@/components/AdministrativeLocationFields'
import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/currency-input'
import { cn } from '@/lib/utils'
import type { ProductMutationInput } from '@/types/product'
import type { Brand, Category, ReferenceValue } from '@/types/reference-data'

const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const WHEEL_SIZES = ['26"', '27.5"', '29"', '700c']
const CONDITION_OPTIONS = [
  { value: 'new_90', label: 'Như mới (90%+)' },
  { value: 'used', label: 'Đã qua sử dụng' },
  { value: 'needs_repair', label: 'Cần sửa chữa' },
] as const

interface NewImageEntry {
  file: File
  preview: string
  isNew: true
}

interface ExistingImageEntry {
  id: string
  url: string
  isNew: false
}

type ImageEntry = NewImageEntry | ExistingImageEntry

interface FormState {
  title: string
  categoryId: string
  brandId: string
  frameSize: string
  wheelSize: string
  groupsetId: string
  brakeTypeId: string
  frameMaterialId: string
  condition: string
  price: string
  originalPrice: string
  description: string
  province: string
  district: string
  images: ImageEntry[]
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; name: string }[]
  placeholder: string
  loading: boolean
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  loading,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {loading ? (
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải...
        </div>
      ) : (
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default function SellerEditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [priceErrors, setPriceErrors] = useState<{ price?: string; originalPrice?: string }>({})
  const [formData, setFormData] = useState<FormState>({
    title: '',
    categoryId: '',
    brandId: '',
    frameSize: '',
    wheelSize: '',
    groupsetId: '',
    brakeTypeId: '',
    frameMaterialId: '',
    condition: '',
    price: '',
    originalPrice: '',
    description: '',
    province: '',
    district: '',
    images: [],
  })

  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brakeTypes, setBrakeTypes] = useState<ReferenceValue[]>([])
  const [frameMaterials, setFrameMaterials] = useState<ReferenceValue[]>([])
  const [groupsets, setGroupsets] = useState<ReferenceValue[]>([])
  const [referenceLoading, setReferenceLoading] = useState(true)

  // Default mock data khi API chưa sẵn sàng
  const DEFAULT_BRANDS: Brand[] = [
    { id: '1', name: 'Trek' },
    { id: '2', name: 'Giant' },
    { id: '3', name: 'Specialized' },
    { id: '4', name: 'Scott' },
    { id: '5', name: 'Cannondale' },
    { id: '6', name: 'Merida' },
    { id: '7', name: 'Cube' },
    { id: '8', name: 'Focus' },
  ]

  const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: 'Road Bike (Xe Đạp Đường Trường)' },
    { id: '2', name: 'Mountain Bike (Xe Đạp Leo Núi)' },
    { id: '3', name: 'City Bike (Xe Đạp Thành Phố)' },
    { id: '4', name: 'Gravel Bike (Xe Đạp Đa Năng)' },
    { id: '5', name: 'Hybrid Bike (Xe Đạp Hybrid)' },
    { id: '6', name: 'Folding Bike (Xe Đạp Gập Gọn)' },
    { id: '7', name: 'BMX' },
    { id: '8', name: 'Fixie' },
  ]

  useEffect(() => {
    if (!id) {
      return
    }

    Promise.all([
      referenceDataApi.getBrands(),
      referenceDataApi.getCategories(),
      referenceDataApi.getBrakeTypes(),
      referenceDataApi.getFrameMaterials(),
      referenceDataApi.getGroupsets(),
      productsApi.getMineById(id),
    ])
      .then(([loadedBrands, loadedCategories, loadedBrakeTypes, loadedFrameMaterials, loadedGroupsets, product]) => {
        setBrands(loadedBrands && loadedBrands.length > 0 ? loadedBrands : DEFAULT_BRANDS)
        setCategories(loadedCategories && loadedCategories.length > 0 ? loadedCategories : DEFAULT_CATEGORIES)
        setBrakeTypes(loadedBrakeTypes)
        setFrameMaterials(loadedFrameMaterials)
        setGroupsets(loadedGroupsets)

        const matchedCategory = loadedCategories.find((category) => category.name === product.categoryName)
        const matchedBrand = loadedBrands.find((brand) => brand.name === product.brandName)
        const matchedBrakeType = loadedBrakeTypes.find((brakeType) => brakeType.name === product.brakeTypeName)
        const matchedMaterial = loadedFrameMaterials.find((material) => material.name === product.frameMaterialName)
        const matchedGroupset = product.groupsetId
          ? loadedGroupsets.find((groupset) => groupset.id === product.groupsetId)
          : loadedGroupsets.find((groupset) => groupset.name === product.groupset)

        setFormData({
          title: product.title ?? '',
          categoryId: matchedCategory?.id ?? '',
          brandId: matchedBrand?.id ?? '',
          frameSize: product.frameSize ?? '',
          wheelSize: product.wheelSize ?? '',
          groupsetId: matchedGroupset?.id ?? '',
          brakeTypeId: matchedBrakeType?.id ?? '',
          frameMaterialId: matchedMaterial?.id ?? '',
          condition: product.condition ?? '',
          price: formatCurrencyInput(product.price),
          originalPrice: formatCurrencyInput(product.originalPrice),
          description: product.description ?? '',
          province: product.province ?? '',
          district: product.district ?? '',
          images: (product.images ?? []).map((image) => ({
            url: image.url,
            id: image.id,
            isNew: false as const,
          })),
        })
      })
      .catch((error) => {
        const response = (error as { response?: { data?: { message?: string; code?: number } } })?.response
        const backendMessage = response?.data?.message
        const code = response?.data?.code

        // Sử dụng default data khi API fails
        setBrands(DEFAULT_BRANDS)
        setCategories(DEFAULT_CATEGORIES)
        setBrakeTypes([])
        setFrameMaterials([])
        setGroupsets([])

        if (code === 1009 || backendMessage?.toLowerCase().includes('not found')) {
          setSubmitError('Sản phẩm đang ở trạng thái chờ duyệt hoặc không tồn tại. Không thể chỉnh sửa.')
        } else {
          setSubmitError(backendMessage || 'Không thể tải thông tin sản phẩm. Vui lòng thử lại.')
        }
      })
      .finally(() => {
        setReferenceLoading(false)
        setIsLoadingProduct(false)
      })
  }, [id])

  function handleChange<K extends keyof FormState>(name: K, value: FormState[K]) {
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handlePriceChange(field: 'price' | 'originalPrice', rawValue: string) {
    handleChange(field, formatCurrencyInput(rawValue))
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files) {
      return
    }

    const newImages: NewImageEntry[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }))

    setFormData((current) => ({
      ...current,
      images: [...current.images, ...newImages],
    }))
  }

  function removeImage(index: number) {
    setFormData((current) => {
      const image = current.images[index]
      if (image.isNew) {
        URL.revokeObjectURL(image.preview)
      }

      return { ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }
    })
  }

  async function handleSubmit() {
    if (!id) {
      return
    }

    // Client-side price validation
    const MAX_PRICE = 1_000_000_000_000
    const nextPriceErrors: { price?: string; originalPrice?: string } = {}
    const parsedPrice = parseCurrencyInput(formData.price)

    if (!formData.price.trim() || parsedPrice === null || parsedPrice <= 0) {
      nextPriceErrors.price = 'Vui lòng nhập giá bán hợp lệ.'
    } else if (parsedPrice > MAX_PRICE) {
      nextPriceErrors.price = 'Giá bán không được vượt quá 1.000 tỷ VND.'
    }

    if (formData.originalPrice.trim()) {
      const parsedOriginalPrice = parseCurrencyInput(formData.originalPrice)

      if (parsedOriginalPrice !== null && parsedOriginalPrice > MAX_PRICE) {
        nextPriceErrors.originalPrice = 'Giá gốc không được vượt quá 1.000 tỷ VND.'
      }
    }

    setPriceErrors(nextPriceErrors)

    if (Object.keys(nextPriceErrors).length > 0) {
      setStep(4)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const newFiles = formData.images
      .filter((image): image is NewImageEntry => image.isNew)
      .map((image) => image.file)

    const payload: ProductMutationInput = {
      title: formData.title,
      description: formData.description,
      price: parseCurrencyInput(formData.price) ?? 0,
      originalPrice: parseCurrencyInput(formData.originalPrice) ?? undefined,
      brandId: formData.brandId || undefined,
      categoryId: formData.categoryId || undefined,
      brakeTypeId: formData.brakeTypeId || undefined,
      frameMaterialId: formData.frameMaterialId || undefined,
      groupsetId: formData.groupsetId || undefined,
      frameSize: formData.frameSize || undefined,
      wheelSize: formData.wheelSize || undefined,
      condition: (formData.condition as ProductMutationInput['condition']) || undefined,
      province: formData.province || undefined,
      district: formData.district || undefined,
      images: newFiles.length > 0 ? newFiles : undefined,
    }

    try {
      await productsApi.update(id, payload)
      navigate(ROUTES.SELLER_LISTINGS)
    } catch (error: unknown) {
      const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string> } } })?.response
      const backendMessage = response?.data?.message
      const backendErrors = response?.data?.errors

      if (backendErrors && Object.keys(backendErrors).length > 0) {
        setSubmitError(`Lỗi dữ liệu: ${Object.values(backendErrors).join(', ')}`)
      } else {
        setSubmitError(backendMessage || 'Cập nhật thất bại. Vui lòng thử lại.')
      }

      setIsSubmitting(false)
    }
  }

  const steps = [
    { num: 1, label: 'Thông tin cơ bản' },
    { num: 2, label: 'Thông số kỹ thuật' },
    { num: 3, label: 'Hình ảnh' },
    { num: 4, label: 'Giá & địa điểm' },
  ]

  if (isLoadingProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (submitError && !formData.title) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="max-w-md space-y-4 px-4 text-center">
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{submitError}</div>
          <Button variant="outline" onClick={() => navigate(ROUTES.SELLER_LISTINGS)}>
            ← Quay lại danh sách tin đăng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="gap-2 px-0" onClick={() => navigate(ROUTES.SELLER_LISTINGS)}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại quản lý tin đăng
            </Button>

            <Logo className="h-8 w-8" showText textClassName="text-base font-bold" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Chỉnh sửa tin đăng</h1>
            <p className="mt-2 text-muted-foreground">Cập nhật thông tin xe đạp của bạn.</p>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          {steps.map((item, index) => (
            <div key={item.num} className="flex items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  step >= item.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {step > item.num ? <CheckCircle2 className="h-5 w-5" /> : item.num}
              </div>

              <span
                className={cn(
                  'ml-2 hidden text-sm sm:block',
                  step >= item.num ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </span>

              {index < steps.length - 1 && (
                <div className={cn('mx-2 h-1 w-12 rounded sm:w-24', step > item.num ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Chỉnh sửa thông tin chung về xe đạp.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tiêu đề tin đăng <span className="text-red-500">*</span>
                </label>
                <Input value={formData.title} onChange={(event) => handleChange('title', event.target.value)} />
              </div>

              <SelectField
                label="Danh mục"
                value={formData.categoryId}
                onChange={(value) => handleChange('categoryId', value)}
                options={categories}
                placeholder="Chọn danh mục"
                loading={referenceLoading}
              />

              <SelectField
                label="Thương hiệu"
                value={formData.brandId}
                onChange={(value) => handleChange('brandId', value)}
                options={brands}
                placeholder="Chọn thương hiệu"
                loading={referenceLoading}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Tình trạng</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITION_OPTIONS.map((condition) => (
                    <Button
                      key={condition.value}
                      type="button"
                      variant={formData.condition === condition.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleChange('condition', condition.value)}
                    >
                      {condition.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả chi tiết</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông số kỹ thuật</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size khung</label>
                  <div className="flex flex-wrap gap-2">
                    {FRAME_SIZES.map((frameSize) => (
                      <Button
                        key={frameSize}
                        type="button"
                        variant={formData.frameSize === frameSize ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleChange('frameSize', frameSize)}
                      >
                        {frameSize}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Kích thước bánh</label>
                  <div className="flex flex-wrap gap-2">
                    {WHEEL_SIZES.map((wheelSize) => (
                      <Button
                        key={wheelSize}
                        type="button"
                        variant={formData.wheelSize === wheelSize ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleChange('wheelSize', wheelSize)}
                      >
                        {wheelSize}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Loại phanh"
                  value={formData.brakeTypeId}
                  onChange={(value) => handleChange('brakeTypeId', value)}
                  options={brakeTypes}
                  placeholder="Chọn loại phanh"
                  loading={referenceLoading}
                />

                <SelectField
                  label="Chất liệu khung"
                  value={formData.frameMaterialId}
                  onChange={(value) => handleChange('frameMaterialId', value)}
                  options={frameMaterials}
                  placeholder="Chọn chất liệu"
                  loading={referenceLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bộ truyền động</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.groupsetId}
                  onChange={(event) => handleChange('groupsetId', event.target.value)}
                >
                  <option value="">Chọn groupset</option>
                  {groupsets.map((groupset) => (
                    <option key={groupset.id} value={groupset.id}>
                      {groupset.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
              <CardDescription>Giữ ảnh cũ hoặc thêm ảnh mới để thay thế.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Ảnh hiện tại sẽ được giữ nguyên. Nếu bạn tải ảnh mới lên, ảnh cũ vẫn được hiển thị cùng để bạn kiểm tra trước khi lưu.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                {formData.images.map((image, index) => (
                  <div key={image.isNew ? image.preview : image.id} className="relative aspect-square overflow-hidden rounded-lg border">
                    <img src={image.isNew ? image.preview : image.url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="mt-1 text-xs text-muted-foreground">Thêm ảnh</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Giá bán & địa điểm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Giá bán <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="VD: 25.000.000"
                    className={cn(priceErrors.price && 'border-destructive focus-visible:ring-destructive')}
                    value={formData.price}
                    onChange={(event) => handlePriceChange('price', event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Số tiền sẽ được tự động định dạng theo VND để người mua dễ đọc.</p>
                  {priceErrors.price ? <p className="text-sm text-destructive">{priceErrors.price}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá gốc</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="VD: 36.000.000"
                    className={cn(priceErrors.originalPrice && 'border-destructive focus-visible:ring-destructive')}
                    value={formData.originalPrice}
                    onChange={(event) => handlePriceChange('originalPrice', event.target.value)}
                  />
                  {priceErrors.originalPrice ? <p className="text-sm text-destructive">{priceErrors.originalPrice}</p> : null}
                </div>
              </div>

              <Separator />

              <AdministrativeLocationFields
                province={formData.province}
                district={formData.district}
                onProvinceChange={(value) => handleChange('province', value)}
                onDistrictChange={(value) => handleChange('district', value)}
              />

              {submitError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{submitError}</div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((currentStep) => Math.max(1, currentStep - 1))}
            disabled={step === 1 || isSubmitting}
          >
            Quay lại
          </Button>

          {step < 4 ? (
            <Button onClick={() => setStep((currentStep) => currentStep + 1)}>Tiếp tục</Button>
          ) : (
            <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
