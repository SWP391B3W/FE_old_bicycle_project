import { useEffect, useMemo, useState } from 'react'
import { Camera, Loader2, Upload } from 'lucide-react'
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
import type { OrderEvidenceInput } from '@/types/order'

interface OrderEvidenceDialogProps {
  open: boolean
  title: string
  description: string
  noteLabel: string
  notePlaceholder: string
  submitLabel: string
  orderTitle: string
  requireFiles?: boolean
  loading?: boolean
  error?: string | null
  helperText?: string
  onClose: () => void
  onSubmit: (values: OrderEvidenceInput) => Promise<void> | void
}

const MAX_FILES = 3

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function OrderEvidenceDialog({
  open,
  title,
  description,
  noteLabel,
  notePlaceholder,
  submitLabel,
  orderTitle,
  requireFiles = false,
  loading = false,
  error,
  helperText,
  onClose,
  onSubmit,
}: OrderEvidenceDialogProps) {
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setNote('')
      setFiles([])
      setValidationError(null)
    }
  }, [open])

  const previewItems = useMemo(
    () =>
      files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    [files],
  )

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [previewItems])

  function handleFileChange(nextFiles: FileList | null) {
    const selectedFiles = nextFiles ? Array.from(nextFiles).slice(0, MAX_FILES) : []
    setFiles(selectedFiles)

    if (nextFiles && nextFiles.length > MAX_FILES) {
      setValidationError(`Bạn chỉ có thể tải lên tối đa ${MAX_FILES} ảnh.`)
      return
    }

    setValidationError(null)
  }

  async function handleSubmit() {
    if (requireFiles && files.length === 0) {
      setValidationError('Vui lòng tải lên ít nhất 1 ảnh chứng cứ.')
      return
    }

    setValidationError(null)
    await onSubmit({
      note: note.trim() || undefined,
      files,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}{' '}
            <span className="font-medium text-foreground">{orderTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="order-evidence-note">{noteLabel}</Label>
            <Textarea
              id="order-evidence-note"
              placeholder={notePlaceholder}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-evidence-files" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Ảnh chứng cứ {requireFiles ? <span className="text-destructive">*</span> : <span>(không bắt buộc)</span>}
            </Label>
            <label
              htmlFor="order-evidence-files"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition hover:border-primary/40 hover:bg-primary/5"
            >
              <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Chọn tối đa 3 ảnh</span>
              <span className="mt-1 text-xs text-muted-foreground">
                Chấp nhận ảnh JPG, PNG, WEBP từ thiết bị của bạn.
              </span>
            </label>
            <input
              id="order-evidence-files"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => handleFileChange(event.target.files)}
            />

            {files.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {previewItems.map((item) => (
                  <div key={`${item.file.name}-${item.file.lastModified}`} className="rounded-lg border bg-card p-2">
                    <div className="aspect-square overflow-hidden rounded-md bg-muted">
                      <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 truncate text-xs font-medium text-foreground">{item.file.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatBytes(item.file.size)}</p>
                  </div>
                ))}
              </div>
            )}

            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
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
                Đang lưu...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
