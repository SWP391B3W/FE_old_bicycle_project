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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ImageUpload from '@/components/ImageUpload'
import { reportsApi } from '@/api/reports.api'
import type { ReportReason } from '@/types/report'
import { Loader2, AlertTriangle } from 'lucide-react'

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetId: string
  targetType: 'PRODUCT' | 'USER'
  targetName: string
}

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'fraud', label: 'Dấu hiệu lừa đảo' },
  { value: 'fake', label: 'Hàng giả, hàng nhái' },
  { value: 'wrong_description', label: 'Mô tả sai sự thật' },
  { value: 'spam', label: 'Tin rác, trùng lặp' },
  { value: 'other', label: 'Lý do khác' },
]

export function ReportModal({ open, onOpenChange, targetId, targetType, targetName }: Readonly<ReportModalProps>) {
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    if (!reason) return

    setIsSubmitting(true)
    setError(null)

    try {
      await reportsApi.submit({
        targetId,
        targetType,
        reason: reason as ReportReason,
        description: description.trim() || undefined,
        files: files.length > 0 ? files : undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        // Reset state after closing
        setReason('')
        setDescription('')
        setFiles([])
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to submit report:', err)
      setError('Đã có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Báo cáo {targetType === 'PRODUCT' ? 'tin đăng' : 'người dùng'}
          </DialogTitle>
          <DialogDescription>
            Bạn đang báo cáo: <span className="font-semibold text-foreground">{targetName}</span>. 
            Vui lòng cung cấp lý do và bằng chứng cụ thể.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-green-600">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium">Cảm ơn bạn đã gửi báo cáo!</p>
            <p className="text-sm text-muted-foreground">Admin sẽ xem xét và xử lý trong thời gian sớm nhất.</p>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lý do báo cáo</label>
              <Select value={reason} onValueChange={(val) => setReason(val as ReportReason)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do vi phạm" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả chi tiết (tùy chọn)</label>
              <Textarea
                placeholder="Cung cấp thêm chi tiết về vi phạm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hình ảnh bằng chứng (nếu có)</label>
              <ImageUpload
                images={[]} 
                onImagesChange={() => {}} // Placeholder for now to fix build
                maxImages={5}
              />
              <p className="text-[11px] text-muted-foreground italic">
                Tối đa 5 ảnh. Dung lượng không quá 5MB/ảnh.
              </p>
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!reason || isSubmitting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi báo cáo'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
