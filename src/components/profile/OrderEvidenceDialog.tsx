import { useEffect, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import type { OrderEvidenceInput } from '@/types/order'

interface OrderEvidenceDialogProps {
  open: boolean
  title: string
  description: string
  noteLabel: string
  notePlaceholder?: string
  submitLabel: string
  orderTitle?: string
  requireFiles?: boolean
  helperText?: string
  loading?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: OrderEvidenceInput) => void | Promise<void>
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
  helperText,
  loading = false,
  error,
  onClose,
  onSubmit,
}: OrderEvidenceDialogProps) {
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setNote('')
      setFiles([])
      setLocalError(null)
    }
  }, [open])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? [])
    setFiles(nextFiles)
    setLocalError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (requireFiles && files.length === 0) {
      setLocalError('Vui lòng tải lên ít nhất một ảnh bằng chứng.')
      return
    }

    setLocalError(null)
    await onSubmit({
      note: note.trim() || undefined,
      files,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !loading && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {orderTitle ? <span className="mt-1 block font-medium text-foreground">{orderTitle}</span> : null}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="order-evidence-note">{noteLabel}</Label>
            <Textarea
              id="order-evidence-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={notePlaceholder}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-evidence-files">
              Ảnh bằng chứng {requireFiles ? '*' : '(tùy chọn)'}
            </Label>
            <Input
              id="order-evidence-files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {files.length > 0 ? (
              <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                Đã chọn {files.length} file: {files.map((file) => file.name).join(', ')}
              </div>
            ) : null}
            {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
          </div>

          {localError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {localError}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
