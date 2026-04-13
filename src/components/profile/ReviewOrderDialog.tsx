import { useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface ReviewOrderFormValues {
  rating: number
  comment: string
}

interface ReviewOrderDialogProps {
  open: boolean
  orderTitle: string
  loading?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: ReviewOrderFormValues) => Promise<void> | void
}

export function ReviewOrderDialog({
  open,
  orderTitle,
  loading = false,
  error,
  onClose,
  onSubmit,
}: ReviewOrderDialogProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setRating(5)
      setComment('')
      setValidationError(null)
    }
  }, [open])

  async function handleSubmit() {
    if (!comment.trim()) {
      setValidationError('Vui lòng nhập nhận xét về trải nghiệm mua bán.')
      return
    }

    setValidationError(null)
    await onSubmit({
      rating,
      comment: comment.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Đánh giá người bán</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn với đơn mua <span className="font-medium text-foreground">{orderTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Mức độ hài lòng</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={cn(
                    'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
                    value <= rating
                      ? 'border-yellow-300 bg-yellow-50 text-yellow-500'
                      : 'border-border text-muted-foreground hover:border-yellow-200 hover:text-yellow-500',
                  )}
                  aria-label={`Chọn ${value} sao`}
                >
                  <Star className={cn('h-5 w-5', value <= rating && 'fill-current')} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Nhận xét</Label>
            <Textarea
              id="review-comment"
              placeholder="Ví dụ: người bán phản hồi nhanh, xe đúng mô tả, giao dịch rõ ràng..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
            />
          </div>

          {(validationError || error) && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {validationError ?? error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
