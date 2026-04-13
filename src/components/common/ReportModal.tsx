import { useState } from 'react'
import { Flag, ImagePlus } from 'lucide-react'
import { reportsApi } from '@/api/reports.api'
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
import type { ReportReason, ReportRequest } from '@/types/report'

export interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetId: string
  targetType: 'product' | 'user'
  targetName?: string
  onSuccess?: () => void
}

interface ReportModalBodyProps extends ReportModalProps {
  onOpenChange: (open: boolean) => void
}

const REPORT_REASONS: Record<'product' | 'user', Array<{ value: ReportReason; label: string }>> = {
  product: [
    { value: 'fake', label: 'Hàng giả hoặc hàng nhái' },
    { value: 'wrong_description', label: 'Thông tin sai lệch về giá, mô tả hoặc hình ảnh' },
    { value: 'fraud', label: 'Tin đăng có dấu hiệu lừa đảo' },
    { value: 'spam', label: 'Hình ảnh hoặc nội dung phản cảm' },
    { value: 'other', label: 'Lý do khác' },
  ],
  user: [
    { value: 'fraud', label: 'Người bán có dấu hiệu lừa đảo' },
    { value: 'fake', label: 'Gian lận đánh giá hoặc danh tính' },
    { value: 'spam', label: 'Spam hoặc quấy rối' },
    { value: 'other', label: 'Lý do khác' },
  ],
}

function ReportModalBody({
  onOpenChange,
  targetId,
  targetType,
  targetName,
  onSuccess,
}: ReportModalBodyProps) {
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!reason) {
      setError('Vui lòng chọn lý do báo cáo.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload: ReportRequest = {
        targetId,
        targetType: targetType.toUpperCase(),
        reason,
        description: description.trim() || undefined,
        files: files.length > 0 ? files : undefined,
      }

      await reportsApi.submit(payload)
      onSuccess?.()
      onOpenChange(false)
    } catch {
      setError('Không thể gửi báo cáo lúc này. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-destructive" />
          Báo cáo {targetType === 'product' ? 'tin đăng' : 'người dùng'}
        </DialogTitle>
        <DialogDescription>
          {targetName ? (
            <span>
              Bạn đang báo cáo: <strong className="text-foreground">{targetName}</strong>
            </span>
          ) : (
            'Vui lòng cung cấp thông tin để admin xem xét.'
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="report-reason">Lý do báo cáo *</Label>
          <Select
            value={reason}
            onValueChange={(value) => {
              setReason(value as ReportReason)
              setError(null)
            }}
          >
            <SelectTrigger id="report-reason">
              <SelectValue placeholder="Chọn lý do" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS[targetType].map((option) => (
                <SelectItem key={`${option.value}-${option.label}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-description">Mô tả thêm</Label>
          <Textarea
            id="report-description"
            rows={4}
            className="resize-none"
            placeholder="Ví dụ: Tin đăng dùng ảnh của xe khác, mô tả sai tình trạng thực tế, hoặc seller yêu cầu chuyển khoản ngoài hệ thống."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-files" className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Ảnh bằng chứng
          </Label>
          <Input
            id="report-files"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          <p className="text-xs text-muted-foreground">
            Hỗ trợ tối đa 3 ảnh. Backend chỉ chấp nhận file ảnh và sẽ lưu cùng báo cáo.
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
          <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          Hủy
        </Button>
        <Button variant="destructive" onClick={() => void handleSubmit()} disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function ReportModal(props: ReportModalProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <ReportModalBody {...props} />}
    </Dialog>
  )
}
