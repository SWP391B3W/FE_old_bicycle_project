// @ts-nocheck
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ImageUpload from '@/components/ImageUpload'
import { refundsApi } from '@/api/refunds.api'
import { Loader2, RotateCcw } from 'lucide-react'
import type { Order } from '@/types/order'

interface RefundModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onSuccess: () => void
}

// Helper to convert base64 to File
function base64ToFile(base64String: string, filename: string): File {
  const arr = base64String.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function RefundModal({ open, onOpenChange, order, onSuccess }: Readonly<RefundModalProps>) {
  const [reason, setReason] = useState('')
  const [evidenceNote, setEvidenceNote] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const refundAmount = order.paidAmount ?? order.buyerChargeAmount ?? 0

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  async function handleSubmit() {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do yêu cầu hoàn tiền.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const files = imagePreviews.map((base64, index) =>
        base64ToFile(base64, `refund-evidence-${index}.jpg`)
      )

      await refundsApi.create(order.id, {
        amount: refundAmount,
        reason: reason.trim(),
        evidenceNote: evidenceNote.trim() || undefined,
        files: files.length > 0 ? files : undefined,
      })

      setSuccess(true)
      onSuccess()
      setTimeout(() => {
        onOpenChange(false)
        setReason('')
        setEvidenceNote('')
        setImagePreviews([])
        setSuccess(false)
      }, 2000)
    } catch (err: unknown) {
      const backendMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(backendMessage || 'Đã có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    if (isSubmitting) return
    onOpenChange(false)
    setReason('')
    setEvidenceNote('')
    setImagePreviews([])
    setError(null)
    setSuccess(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-red-500" />
            Yêu cầu hoàn tiền
          </DialogTitle>
          <DialogDescription>
            Đơn hàng: <span className="font-semibold text-foreground">{order.productTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-green-600">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium">Yêu cầu hoàn tiền đã được gửi!</p>
            <p className="text-sm text-muted-foreground">Admin sẽ xem xét và liên hệ với bạn trong thời gian sớm nhất.</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Refund amount info */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                Số tiền yêu cầu hoàn:{' '}
                <span className="font-bold text-amber-900">{formatCurrency(refundAmount)}</span>
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Admin sẽ xem xét và xử lý hoàn tiền thủ công sau khi duyệt yêu cầu.
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Lý do hoàn tiền <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Mô tả lý do bạn muốn hoàn tiền (ví dụ: xe không đúng mô tả, người bán giao sai hàng...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Evidence note */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ghi chú bổ sung (tùy chọn)</label>
              <Textarea
                placeholder="Thông tin thêm để hỗ trợ yêu cầu của bạn..."
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
                className="min-h-[70px] resize-none"
                rows={2}
              />
            </div>

            {/* Images */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Hình ảnh bằng chứng (nếu có)</label>
              <ImageUpload
                images={imagePreviews}
                onImagesChange={setImagePreviews}
                maxImages={3}
              />
              <p className="text-[11px] text-muted-foreground italic">
                Tối đa 3 ảnh. Dung lượng không quá 5MB/ảnh.
              </p>
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason.trim() || isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi yêu cầu hoàn tiền'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
