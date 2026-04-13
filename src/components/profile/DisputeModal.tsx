import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ImagePlus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatOrderCurrency } from '@/lib/order-display'

export interface RefundFormValues {
  reason: string
  evidenceNote?: string
  files?: File[]
}

interface DisputeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: RefundFormValues) => Promise<void> | void
  orderId: string
  refundAmount: number
  isSubmitting?: boolean
  error?: string | null
  payoutProfileReady?: boolean
}

interface DisputeModalBodyProps {
  onClose: () => void
  onSubmit: (values: RefundFormValues) => Promise<void> | void
  orderId: string
  refundAmount: number
  isSubmitting: boolean
  error: string | null
  payoutProfileReady: boolean
}

const reasonOptions = [
  'Xe không giống mô tả',
  'Hàng bị hỏng hoặc trầy xước',
  'Thiếu phụ kiện đi kèm',
  'Nghi ngờ giấy tờ giả',
  'Chưa nhận được hàng nhưng đã báo giao',
]

function DisputeModalBody({
  onClose,
  onSubmit,
  orderId,
  refundAmount,
  isSubmitting,
  error,
  payoutProfileReady,
}: DisputeModalBodyProps) {
  const [reason, setReason] = useState('')
  const [evidenceNote, setEvidenceNote] = useState('')
  const [files, setFiles] = useState<File[]>([])

  async function handleSubmit() {
    if (!reason) {
      return
    }

    await onSubmit({
      reason,
      evidenceNote: evidenceNote.trim() || undefined,
      files: files.length > 0 ? files : undefined,
    })
  }

  return (
    <DialogContent className="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Yêu cầu hoàn tiền
        </DialogTitle>
        <DialogDescription>
          Đơn hàng <span className="font-semibold text-foreground">{orderId}</span> đang ở trạng thái đã đặt cọc.
          Hãy chọn lý do và gửi bằng chứng rõ ràng để admin xem xét yêu cầu hoàn tiền.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-sm">
        <p className="font-medium text-foreground">Số tiền hệ thống sẽ yêu cầu hoàn</p>
        <p className="mt-1 text-lg font-bold text-primary">{formatOrderCurrency(refundAmount)}</p>
        <p className="mt-2 text-muted-foreground">
          Backend hiện chỉ cho tạo yêu cầu hoàn đúng bằng số tiền buyer đã thanh toán trong hệ thống.
        </p>
      </div>

      {!payoutProfileReady && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="flex items-start gap-2">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-2">
              <p className="font-medium">Bạn chưa hoàn tất tài khoản nhận hoàn tiền.</p>
              <p>
                Bạn vẫn có thể gửi yêu cầu hoàn tiền ngay. Tuy nhiên nếu admin duyệt hoàn, hệ thống sẽ bị chặn ở bước
                chuyển khoản cho đến khi bạn cập nhật payout profile.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile?tab=payout">Cập nhật tài khoản nhận tiền</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="refund-reason">
            Lý do hoàn tiền <span className="text-red-500">*</span>
          </Label>
          <Select value={reason} onValueChange={(val) => setReason(val ?? '')}>
            <SelectTrigger id="refund-reason">
              <SelectValue placeholder="Chọn lý do phù hợp" />
            </SelectTrigger>
            <SelectContent>
              {reasonOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="refund-evidence">Ghi chú mô tả</Label>
          <Textarea
            id="refund-evidence"
            value={evidenceNote}
            onChange={(event) => setEvidenceNote(event.target.value)}
            placeholder="Ví dụ: Xe bị trầy sâu ở khung, thiếu pedal như bài đăng và tôi đã chụp ảnh khi mở hàng."
            className="min-h-[120px] resize-none"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="refund-files" className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Ảnh bằng chứng
          </Label>
          <Input
            id="refund-files"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          <p className="text-xs text-muted-foreground">
            Hỗ trợ tối đa 3 ảnh. Backend chỉ chấp nhận file ảnh và sẽ lưu cùng yêu cầu hoàn tiền.
          </p>
          {files.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`} className="truncate">
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button variant="destructive" onClick={() => void handleSubmit()} disabled={isSubmitting || !reason}>
          {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu hoàn tiền'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function DisputeModal({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  refundAmount,
  isSubmitting = false,
  error = null,
  payoutProfileReady = false,
}: DisputeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <DisputeModalBody
          onClose={onClose}
          onSubmit={onSubmit}
          orderId={orderId}
          refundAmount={refundAmount}
          isSubmitting={isSubmitting}
          error={error}
          payoutProfileReady={payoutProfileReady}
        />
      )}
    </Dialog>
  )
}
