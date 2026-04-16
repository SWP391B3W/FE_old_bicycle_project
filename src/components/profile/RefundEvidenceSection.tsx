import type { RefundEvidenceFile } from '@/types/refund'

interface RefundEvidenceSectionProps {
  title: string
  files?: RefundEvidenceFile[] | null
}

export function RefundEvidenceSection({ title, files }: RefundEvidenceSectionProps) {
  if (!files || files.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <span className="text-xs text-muted-foreground">{files.length} ảnh</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {files.map((file) => (
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
              <p className="truncate text-xs font-medium text-foreground">{file.fileName ?? 'Ảnh bằng chứng'}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
