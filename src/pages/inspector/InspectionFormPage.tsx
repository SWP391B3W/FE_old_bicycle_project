import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Loader2,
  MapPin,
  Paperclip,
  ShieldCheck,
  Tag,
  User,
  XCircle,
} from 'lucide-react'
import { inspectionsApi } from '@/api/inspections.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatPriceDisplay } from '@/lib/currency-input'
import type { Inspection, InspectionEvaluationRequest } from '@/types/inspection'
import type { Product } from '@/types/product'

interface ScoreItem {
  id: keyof Pick<
    InspectionEvaluationRequest,
    'frameScore' | 'forkScore' | 'brakesScore' | 'drivetrainScore' | 'wheelsScore'
  >
  label: string
  score: number
}

const INITIAL_SCORES: ScoreItem[] = [
  { id: 'frameScore', label: 'Khung (Frame)', score: 5 },
  { id: 'forkScore', label: 'Phuộc (Fork)', score: 5 },
  { id: 'brakesScore', label: 'Phanh (Brakes)', score: 5 },
  { id: 'drivetrainScore', label: 'Truyền động (Drivetrain)', score: 5 },
  { id: 'wheelsScore', label: 'Bánh xe (Wheels)', score: 5 },
]

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

const CONDITION_LABEL: Record<string, string> = {
  new_90: 'Như mới (90%+)',
  used: 'Đã qua sử dụng',
  needs_repair: 'Cần sửa chữa',
}

function BikeDetailDialog({ product }: { product: Product | null }) {
  const [imgIndex, setImgIndex] = useState(0)
  const images = product?.images ?? []
  const sortedImages = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))

  const specs: Array<{ label: string; value?: string | number | null }> = [
    { label: 'Thương hiệu', value: product?.brandName },
    { label: 'Danh mục', value: product?.categoryName },
    { label: 'Kích thước khung', value: product?.frameSize },
    { label: 'Cỡ bánh', value: product?.wheelSize },
    { label: 'Groupset', value: product?.groupset },
    { label: 'Phanh', value: product?.brakeTypeName },
    { label: 'Chất liệu khung', value: product?.frameMaterialName },
  ].filter((spec) => spec.value)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-3 gap-2 w-full sm:w-auto">
          <Info className="h-4 w-4" />
          Xem chi tiết xe
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="line-clamp-2 pr-6 text-left text-lg">
            {product?.title ?? 'Chi tiết xe đạp'}
          </DialogTitle>
        </DialogHeader>

        {/* Image carousel */}
        {sortedImages.length > 0 && (
          <div className="relative overflow-hidden rounded-xl bg-muted">
            <img
              src={sortedImages[imgIndex]?.url}
              alt={`Ảnh ${imgIndex + 1}`}
              className="h-64 w-full object-cover"
            />
            {sortedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i - 1 + sortedImages.length) % sortedImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i + 1) % sortedImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {sortedImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImgIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === imgIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white">
              {imgIndex + 1}/{sortedImages.length}
            </div>
          </div>
        )}

        {/* Price + Condition */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-bold text-primary">
            {product ? formatPriceDisplay(product.price) : '—'}
          </span>
          {product?.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPriceDisplay(product.originalPrice)}
            </span>
          )}
          {product?.condition && (
            <Badge variant="secondary">
              {CONDITION_LABEL[product.condition] ?? product.condition}
            </Badge>
          )}
        </div>

        {/* Seller + Location */}
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          {product?.seller && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>
                {product.seller.firstName} {product.seller.lastName}
                {product.seller.phone && (
                  <span className="ml-2 font-mono text-foreground">{product.seller.phone}</span>
                )}
              </span>
            </div>
          )}
          {(product?.province || product?.district) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{[product.district, product.province].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Technical specs */}
        {specs.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Tag className="h-4 w-4" />
              Thông số kỹ thuật
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border p-3 text-sm">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <span className="text-muted-foreground">{spec.label}: </span>
                  <span className="font-medium text-foreground">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product?.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Mô tả của người bán</h4>
            <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm text-foreground/80">
              {product.description}
            </p>
          </div>
        )}

        {/* No info fallback */}
        {!product && (
          <div className="py-8 text-center text-muted-foreground">Chưa tải được thông tin xe.</div>
        )}
      </DialogContent>
    </Dialog>
  )
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

function buildScoresFromInspection(inspection: Inspection | null): ScoreItem[] {
  return INITIAL_SCORES.map((item) => ({
    ...item,
    score: inspection?.[item.id] ?? item.score,
  }))
}

export default function InspectionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [scores, setScores] = useState<ScoreItem[]>(INITIAL_SCORES)
  const [wearPercentage, setWearPercentage] = useState('10')
  const [notes, setNotes] = useState('')
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadContext() {
      if (!id) {
        return
      }

      setLoading(true)

      try {
        const [productResult, inspectionResult] = await Promise.all([
          inspectionsApi.getProductContext(id),
          inspectionsApi.getByProduct(id),
        ])

        if (ignore) {
          return
        }

        setProduct(productResult)
        setInspection(inspectionResult)
        setScores(buildScoresFromInspection(inspectionResult))
        setWearPercentage(String(inspectionResult?.wearPercentage ?? 10))
        setNotes(inspectionResult?.expertNotes ?? '')
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setError(getErrorMessage(requestError, 'Không thể tải thông tin kiểm định cho xe này.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadContext()

    return () => {
      ignore = true
    }
  }, [id])

  const wearNumRaw = Number(wearPercentage) || 0
  const wearNum = Math.min(100, Math.max(0, wearNumRaw))
  const isNewCondition = product?.condition === 'new_90'
  const wearExceedsNewLimit = isNewCondition && wearNumRaw > 10
  const isWearExceedsHundred = wearNumRaw > 100

  const overallScore = useMemo(() => {
    const average = scores.reduce((total, item) => total + item.score, 0) / scores.length
    const wear = Math.min(100, Math.max(0, Number(wearPercentage) || 0))
    const adjusted = average * (1 - wear / 100)
    return Math.max(0, adjusted).toFixed(1)
  }, [scores, wearPercentage])

  function handleScoreChange(scoreId: ScoreItem['id'], value: number) {
    setScores((current) =>
      current.map((scoreItem) =>
        scoreItem.id === scoreId ? { ...scoreItem, score: value } : scoreItem,
      ),
    )
  }

  async function handleSubmit(passed: boolean) {
    if (!id) {
      return
    }

    if (isWearExceedsHundred) {
      setError('Hao mòn chung không thể vượt quá 100%. Vui lòng sửa lại trước khi gửi.')
      return
    }

    if (wearExceedsNewLimit) {
      setError('Xe “Như mới 90%+” không thể có hao mòn vượt quá 10%. Vui lòng sửa lại trước khi gửi.')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      if (reportFile) {
        const uploadedInspection = await inspectionsApi.uploadReport(id, reportFile)
        setInspection(uploadedInspection)
      }

      const payload: InspectionEvaluationRequest = {
        frameScore: scores.find((item) => item.id === 'frameScore')!.score,
        forkScore: scores.find((item) => item.id === 'forkScore')!.score,
        brakesScore: scores.find((item) => item.id === 'brakesScore')!.score,
        drivetrainScore: scores.find((item) => item.id === 'drivetrainScore')!.score,
        wheelsScore: scores.find((item) => item.id === 'wheelsScore')!.score,
        wearPercentage: Number(wearPercentage),
        expertNotes: notes.trim() || undefined,
        passed,
      }

      await inspectionsApi.evaluate(id, payload)
      navigate('/inspector/history')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Gửi kết quả kiểm định thất bại. Vui lòng thử lại.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Phiếu kiểm định</h2>
          <p className="text-muted-foreground">
            Điền điểm cho từng hạng mục, ghi chú nhận xét và xác nhận xe đạt hay không đạt.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="h-40 overflow-hidden rounded-xl bg-muted lg:w-64">
                {product?.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ShieldCheck className="h-10 w-10 opacity-40" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{product?.title ?? `Xe #${id}`}</h3>
                <p className="text-sm text-muted-foreground">
                  Người bán: {product?.seller ? `${product.seller.firstName} ${product.seller.lastName}` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Giá đăng: {product ? formatPriceDisplay(product.price) : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tỉnh thành: {product?.province || 'Chưa cập nhật'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Yêu cầu gửi lúc: {formatDateTime(inspection?.createdAt)}
                </p>
                <BikeDetailDialog product={product} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Chấm điểm từng hạng mục</h3>
                <p className="text-sm text-muted-foreground">
                  Thang điểm ở đây là từ 1 đến 5, trong đó 5 là tốt nhất.
                </p>
              </div>

              {scores.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-medium text-foreground">{item.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleScoreChange(item.id, value)}
                        className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${
                          item.score === value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="grid gap-2 border-t border-border pt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">% hao mòn chung</label>
                    {isNewCondition && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Xe “Như mới 90%+” — tối đa <strong>10%</strong>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={isNewCondition ? '10' : '100'}
                      value={wearPercentage}
                      onChange={(event) => {
                        const val = event.target.value
                        setWearPercentage(val)
                      }}
                      className={`w-24 text-center ${wearExceedsNewLimit || isWearExceedsHundred ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                {isWearExceedsHundred ? (
                  <p className="text-xs text-destructive">
                    ⚠️ Hao mòn chung không thể vượt quá 100%.
                  </p>
                ) : wearExceedsNewLimit ? (
                  <p className="text-xs text-destructive">
                    ⚠️ Xe tag “Như mới 90%+” không thể có hao mòn vượt quá 10%.
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <span className="font-semibold text-foreground">Điểm tổng thể</span>
                  <p className="text-xs text-muted-foreground">
                    = điểm TB × (1 − {wearNum}%)
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary">{overallScore}/5</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-foreground">Ghi chú chuyên gia</h3>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ghi nhận các lỗi quan trọng, khuyến nghị sửa chữa hoặc điểm mạnh của xe..."
              className="mt-4 h-36 w-full rounded-lg border border-border bg-muted p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="mt-6 space-y-3 border-t border-border pt-4">
              <div>
                <h4 className="font-medium text-foreground">Báo cáo đính kèm</h4>
                <p className="text-sm text-muted-foreground">
                  Có thể tải lên file PDF hoặc tài liệu scan để seller xem lại sau khi có kết quả kiểm định.
                </p>
              </div>

              <Input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={(event) => setReportFile(event.target.files?.[0] ?? null)}
              />

              {reportFile && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Paperclip className="h-4 w-4" />
                  <span>{reportFile.name}</span>
                </div>
              )}

              {inspection?.reportFileUrl && !reportFile && (
                <a
                  href={inspection.reportFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Xem báo cáo hiện tại
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              onClick={() => handleSubmit(true)}
              disabled={submitting || wearExceedsNewLimit || isWearExceedsHundred}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Đạt chuẩn
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleSubmit(false)}
              disabled={submitting || wearExceedsNewLimit || isWearExceedsHundred}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Không đạt
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
