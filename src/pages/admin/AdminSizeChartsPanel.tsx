import { useState } from 'react'
import { AlertCircle, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Category, SizeChart, SizeChartRowUpsertRequest, SizeChartUpsertRequest } from '@/types/reference-data'

type EditableSizeChartRow = {
  frameSize: string
  heightMinCm: string
  heightMaxCm: string
  note: string
}

type EditableSizeChartForm = {
  categoryId: string
  name: string
  description: string
  rows: EditableSizeChartRow[]
}

const createEmptyRow = (): EditableSizeChartRow => ({
  frameSize: '',
  heightMinCm: '',
  heightMaxCm: '',
  note: '',
})

const createEmptyForm = (): EditableSizeChartForm => ({
  categoryId: '',
  name: '',
  description: '',
  rows: [createEmptyRow()],
})

interface AdminSizeChartsPanelProps {
  charts: SizeChart[]
  categories: Category[]
  loading: boolean
  error: string | null
  onAdd: (request: SizeChartUpsertRequest) => Promise<void>
  onUpdate: (id: string, request: SizeChartUpsertRequest) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default function AdminSizeChartsPanel({
  charts,
  categories,
  loading,
  error,
  onAdd,
  onUpdate,
  onDelete,
}: AdminSizeChartsPanelProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState<EditableSizeChartForm>(createEmptyForm())
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditableSizeChartForm>(createEmptyForm())
  const [actionId, setActionId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const updateRow = (
    rows: EditableSizeChartRow[],
    rowIndex: number,
    key: keyof EditableSizeChartRow,
    value: string,
  ) => rows.map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row))

  const mapFormToRequest = (form: EditableSizeChartForm): SizeChartUpsertRequest | null => {
    if (!form.categoryId || !form.name.trim()) {
      setSubmitError('Vui lòng chọn danh mục và nhập tên size chart.')
      return null
    }

    const rows: SizeChartRowUpsertRequest[] = []
    for (const row of form.rows) {
      if (!row.frameSize.trim() || !row.heightMinCm.trim() || !row.heightMaxCm.trim()) {
        setSubmitError('Mỗi dòng phải có frame size, chiều cao tối thiểu và tối đa.')
        return null
      }

      const heightMinCm = Number(row.heightMinCm)
      const heightMaxCm = Number(row.heightMaxCm)
      if (!Number.isFinite(heightMinCm) || !Number.isFinite(heightMaxCm) || heightMinCm > heightMaxCm) {
        setSubmitError('Khoảng chiều cao không hợp lệ.')
        return null
      }

      rows.push({
        frameSize: row.frameSize.trim(),
        heightMinCm,
        heightMaxCm,
        note: row.note.trim() || undefined,
      })
    }

    setSubmitError(null)
    return {
      categoryId: form.categoryId,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      rows,
    }
  }

  const startEdit = (chart: SizeChart) => {
    setEditId(chart.id)
    setEditForm({
      categoryId: chart.categoryId,
      name: chart.name,
      description: chart.description ?? '',
      rows: chart.rows.map((row) => ({
        frameSize: row.frameSize,
        heightMinCm: String(row.heightMinCm),
        heightMaxCm: String(row.heightMaxCm),
        note: row.note ?? '',
      })),
    })
    setSubmitError(null)
  }

  const handleCreate = async () => {
    const request = mapFormToRequest(createForm)
    if (!request) return

    setActionId('create')
    try {
      await onAdd(request)
      setCreateForm(createEmptyForm())
      setShowCreateForm(false)
    } finally {
      setActionId(null)
    }
  }

  const handleUpdate = async () => {
    if (!editId) return
    const request = mapFormToRequest(editForm)
    if (!request) return

    setActionId(editId)
    try {
      await onUpdate(editId, request)
      setEditId(null)
      setEditForm(createEmptyForm())
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa size chart này không?')) return

    setDeleteError(null)
    setActionId(id)
    try {
      await onDelete(id)
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } })?.response?.data?.message
      setDeleteError(message ?? 'Không thể xóa size chart lúc này.')
    } finally {
      setActionId(null)
    }
  }

  const renderForm = (
    form: EditableSizeChartForm,
    setForm: (form: EditableSizeChartForm) => void,
    submitLabel: string,
    onSubmit: () => Promise<void>,
    onCancel: () => void,
    busy: boolean,
  ) => (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={form.categoryId}
          onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Input
          placeholder="Tên size chart"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </div>
      <Input
        placeholder="Mô tả (không bắt buộc)"
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Các dòng size chart</div>
          <Button size="sm" variant="outline" onClick={() => setForm({ ...form, rows: [...form.rows, createEmptyRow()] })}>
            <Plus className="mr-1 h-4 w-4" />
            Thêm dòng
          </Button>
        </div>

        {form.rows.map((row, index) => (
          <div key={`${row.frameSize}-${index}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_2fr_auto]">
            <Input
              placeholder="Frame size"
              value={row.frameSize}
              onChange={(event) => setForm({ ...form, rows: updateRow(form.rows, index, 'frameSize', event.target.value) })}
            />
            <Input
              inputMode="numeric"
              placeholder="Min cm"
              value={row.heightMinCm}
              onChange={(event) => setForm({ ...form, rows: updateRow(form.rows, index, 'heightMinCm', event.target.value) })}
            />
            <Input
              inputMode="numeric"
              placeholder="Max cm"
              value={row.heightMaxCm}
              onChange={(event) => setForm({ ...form, rows: updateRow(form.rows, index, 'heightMaxCm', event.target.value) })}
            />
            <Input
              placeholder="Ghi chú"
              value={row.note}
              onChange={(event) => setForm({ ...form, rows: updateRow(form.rows, index, 'note', event.target.value) })}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setForm({ ...form, rows: form.rows.filter((_, rowIndex) => rowIndex !== index) })}
              disabled={form.rows.length === 1}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {submitError && <ErrorBanner message={submitError} />}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Hủy</Button>
        <Button onClick={() => void onSubmit()} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {deleteError && <ErrorBanner message={deleteError} />}

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowCreateForm(true)} disabled={showCreateForm || categories.length === 0}>
          <Plus className="mr-1 h-4 w-4" />
          Thêm size chart
        </Button>
      </div>

      {showCreateForm
        ? renderForm(
            createForm,
            setCreateForm,
            'Lưu size chart',
            handleCreate,
            () => {
              setShowCreateForm(false)
              setCreateForm(createEmptyForm())
              setSubmitError(null)
            },
            actionId === 'create',
          )
        : null}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : charts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Chưa có size chart nào.</p>
      ) : (
        <div className="space-y-4">
          {charts.map((chart) => (
            <div key={chart.id} className="space-y-3 rounded-xl border p-4">
              {editId === chart.id
                ? renderForm(
                    editForm,
                    setEditForm,
                    'Cập nhật size chart',
                    handleUpdate,
                    () => {
                      setEditId(null)
                      setEditForm(createEmptyForm())
                      setSubmitError(null)
                    },
                    actionId === chart.id,
                  )
                : (
                    <>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">{chart.categoryName}</div>
                          <h3 className="text-lg font-semibold">{chart.name}</h3>
                          {chart.description ? <p className="text-sm text-muted-foreground">{chart.description}</p> : null}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(chart)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void handleDelete(chart.id)} disabled={actionId === chart.id}>
                            {actionId === chart.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4 text-destructive" />}
                            Xóa
                          </Button>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full text-sm">
                          <thead className="bg-muted/40 text-left">
                            <tr>
                              <th className="px-4 py-3 font-medium">Frame size</th>
                              <th className="px-4 py-3 font-medium">Chiều cao</th>
                              <th className="px-4 py-3 font-medium">Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chart.rows.map((row) => (
                              <tr key={row.id} className="border-t">
                                <td className="px-4 py-3 font-medium">{row.frameSize}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.heightMinCm} - {row.heightMaxCm} cm</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.note ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
