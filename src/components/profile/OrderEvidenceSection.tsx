import type { OrderEvidenceSubmission } from '@/types/order'

interface OrderEvidenceSectionProps {
  title: string
  evidence?: OrderEvidenceSubmission | null
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function OrderEvidenceSection({ title, evidence }: OrderEvidenceSectionProps) {
  if (!evidence) {
    return null
  }

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <span className="text-xs text-muted-foreground">{formatDateTime(evidence.createdAt)}</span>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Người gửi: <span className="font-medium text-foreground">{evidence.submittedByName}</span>
      </p>

      {evidence.note && (
        <p className="mt-3 rounded-lg bg-background px-3 py-2 text-sm text-foreground">{evidence.note}</p>
      )}

      {evidence.files.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {evidence.files.map((file) => (
            <a
              key={file.id}
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-lg border bg-card transition hover:border-primary/40"
            >
              <div className="aspect-square bg-muted">
                <img src={file.fileUrl} alt={file.fileName ?? title} className="h-full w-full object-cover" />
              </div>
              <div className="px-3 py-2">
                <p className="truncate text-xs font-medium text-foreground">{file.fileName ?? 'Ảnh chứng cứ'}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
