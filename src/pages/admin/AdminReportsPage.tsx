import { useCallback, useEffect, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { CheckCircle, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Search } from 'lucide-react'
import { reportsApi } from '@/api/reports.api'
import { ReportEvidenceSection } from '@/components/common/ReportEvidenceSection'
import { DataTable } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Report, ReportStatus } from '@/types/report'

const targetTypeLabels: Record<string, string> = {
  product: 'Tin đăng',
  user: 'Người dùng',
  PRODUCT: 'Tin đăng',
  USER: 'Người dùng',
}

const STATUS_FILTER_MAP: Record<string, string> = {
  'Tất cả trạng thái': 'all',
  'Chờ xử lý': 'pending',
  'Đang điều tra': 'investigating',
  'Xác nhận vi phạm': 'resolved_upheld',
  'Bác bỏ báo cáo': 'resolved_dismissed',
}

const TARGET_TYPE_FILTER_MAP: Record<string, string> = {
  'Tất cả loại': 'all',
  'Tin đăng': 'PRODUCT',
  'Người dùng': 'USER',
}

const statusLabels: Record<ReportStatus, string> = {
  pending: 'Chờ xử lý',
  investigating: 'Đang điều tra',
  resolved_upheld: 'Xác nhận vi phạm',
  resolved_dismissed: 'Bác bỏ báo cáo',
}

const reasonLabels: Record<string, string> = {
  fraud: 'Dấu hiệu lừa đảo',
  fake: 'Hàng giả, hàng nhái',
  wrong_description: 'Mô tả sai sự thật',
  spam: 'Tin rác, trùng lặp',
  other: 'Lý do khác',
}

type ProcessStatusSelection = ReportStatus | ''

function canProcessReport(status: ReportStatus) {
  return status === 'pending' || status === 'investigating'
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Tất cả trạng thái')
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('Tất cả loại')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; report: Report | null }>({
    open: false,
    report: null,
  })
  const [processDialog, setProcessDialog] = useState<{
    open: boolean
    reportId: string
    currentStatus: ReportStatus | null
    status: ProcessStatusSelection
    adminNote: string
    loading: boolean
  }>({
    open: false,
    reportId: '',
    currentStatus: null,
    status: '',
    adminNote: '',
    loading: false,
  })

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const mappedStatus = STATUS_FILTER_MAP[statusFilter] || 'all'
      const mappedTargetType = TARGET_TYPE_FILTER_MAP[targetTypeFilter] || 'all'

      const result = await reportsApi.getAdminReports({
        status: mappedStatus !== 'all' ? (mappedStatus as ReportStatus) : undefined,
        targetType: mappedTargetType !== 'all' ? mappedTargetType : undefined,
        page,
        size: 10,
      })

      const filtered = searchQuery
        ? result.content.filter((report) => {
          const needle = searchQuery.toLowerCase()
          return (
            report.reporterName?.toLowerCase().includes(needle) ||
            report.targetId?.toLowerCase().includes(needle) ||
            report.reason?.toLowerCase().includes(needle)
          )
        })
        : result.content

      setReports(filtered)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setError('Không thể tải danh sách báo cáo.')
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, statusFilter, targetTypeFilter])

  useEffect(() => {
    void fetchReports()
  }, [fetchReports])

  function openProcessDialog(report: Report) {
    setProcessDialog({
      open: true,
      reportId: report.id,
      currentStatus: report.status,
      status: '',
      adminNote: '',
      loading: false,
    })
  }

  async function handleProcess() {
    if (!processDialog.status) {
      return
    }

    setProcessDialog((prev) => ({ ...prev, loading: true }))

    try {
      await reportsApi.process(processDialog.reportId, {
        status: processDialog.status,
        adminNote: processDialog.adminNote || undefined,
      })
      setProcessDialog({
        open: false,
        reportId: '',
        currentStatus: null,
        status: '',
        adminNote: '',
        loading: false,
      })
      await fetchReports()
    } catch {
      setProcessDialog((prev) => ({ ...prev, loading: false }))
      setError('Xử lý báo cáo thất bại')
    }
  }

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'reporterName',
      header: 'Người báo cáo',
    },
    {
      accessorKey: 'targetType',
      header: 'Đối tượng',
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {targetTypeLabels[row.original.targetType] || row.original.targetType}
          </p>
          <p className="text-xs text-foreground font-medium">
            {row.original.targetType?.toUpperCase() === 'USER'
              ? (row.original.reporterName ? `ID: ${row.original.targetId.substring(0, 8)}...` : '—')
              : `ID: ${row.original.targetId.substring(0, 8)}...`}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Lý do',
      cell: ({ row }) => reasonLabels[row.original.reason] ?? row.original.reason,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          labelOverride={statusLabels[row.original.status]}
        />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày báo cáo',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('vi-VN'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailDialog({ open: true, report: row.original })}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            {canProcessReport(row.original.status) && (
              <DropdownMenuItem onClick={() => openProcessDialog(row.original)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Cập nhật xử lý
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Báo cáo vi phạm</h2>
        <p className="text-muted-foreground">
          Xử lý các báo cáo từ người dùng.
          {!loading && <span className="ml-1 text-xs">({totalElements} báo cáo)</span>}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm báo cáo..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(0)
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value ?? 'Tất cả trạng thái')
            setPage(0)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(STATUS_FILTER_MAP).map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={targetTypeFilter}
          onValueChange={(value) => {
            setTargetTypeFilter(value ?? 'Tất cả loại')
            setPage(0)
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(TARGET_TYPE_FILTER_MAP).map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={reports} showPagination={false} />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={totalPages === 0 || page >= totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo</DialogTitle>
            <DialogDescription>
              Xem chi tiết nội dung báo cáo, bằng chứng người dùng gửi kèm, và trạng thái xử lý hiện tại.
            </DialogDescription>
          </DialogHeader>
          {detailDialog.report && (
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                {[
                  ['Người báo cáo', detailDialog.report.reporterName],
                  ['Loại đối tượng', targetTypeLabels[detailDialog.report.targetType] || detailDialog.report.targetType],
                  ['ID đối tượng', detailDialog.report.targetId],
                  ['Lý do', detailDialog.report.reason],
                  ['Mô tả', detailDialog.report.description || '—'],
                  ['Trạng thái', statusLabels[detailDialog.report.status] || detailDialog.report.status],
                  ['Ngày báo cáo', new Date(detailDialog.report.createdAt).toLocaleString('vi-VN')],
                  ...(detailDialog.report.adminNote ? [['Ghi chú admin', detailDialog.report.adminNote]] : []),
                  ...(detailDialog.report.processedByName ? [['Xử lý bởi', detailDialog.report.processedByName]] : []),
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between border-b border-border pb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="max-w-[60%] text-right font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <ReportEvidenceSection
                title="Ảnh bằng chứng người dùng gửi kèm"
                files={detailDialog.report.evidenceFiles}
              />

              {canProcessReport(detailDialog.report.status) && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      const report = detailDialog.report!
                      setDetailDialog({ open: false, report: null })
                      setTimeout(() => openProcessDialog(report), 100)
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Cập nhật xử lý báo cáo này
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={processDialog.open} onOpenChange={(open) => setProcessDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật xử lý báo cáo</DialogTitle>
            <DialogDescription>
              {processDialog.currentStatus === 'pending'
                ? 'Chọn bước xử lý tiếp theo cho báo cáo mới.'
                : 'Báo cáo đang điều tra. Chọn kết quả cuối cùng cho case này.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Kết quả xử lý</label>
              <select
                value={processDialog.status}
                onChange={(e) => setProcessDialog((prev) => ({ ...prev, status: e.target.value as ReportStatus }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Chọn kết quả xử lý</option>
                {processDialog.currentStatus === 'pending' && (
                  <option value="investigating">Chuyển sang đang điều tra</option>
                )}
                <option value="resolved_upheld">Xác nhận vi phạm</option>
                <option value="resolved_dismissed">Bác bỏ báo cáo</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Ghi chú admin (tùy chọn)</label>
              <Textarea
                placeholder="Nhập ghi chú..."
                value={processDialog.adminNote}
                onChange={(event) => setProcessDialog((prev) => ({ ...prev, adminNote: event.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setProcessDialog({
                    open: false,
                    reportId: '',
                    currentStatus: null,
                    status: '',
                    adminNote: '',
                    loading: false,
                  })
                }
              >
                Hủy
              </Button>
              <Button onClick={() => void handleProcess()} disabled={processDialog.loading || !processDialog.status}>
                {processDialog.loading ? 'Đang lưu...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
