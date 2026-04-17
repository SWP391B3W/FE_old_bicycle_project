import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2, Check, X, Loader2, AlertCircle, Tags, Award, Disc, Layers, Ruler } from 'lucide-react'
import { referenceDataApi } from '@/api/reference-data.api'
import type { Brand, Category, ReferenceValue, SizeChart } from '@/types/reference-data'
import AdminSizeChartsPanel from './AdminSizeChartsPanel'

// ── types ──────────────────────────────────────────────────────────────────

type TabId = 'categories' | 'brands' | 'brakeTypes' | 'frameMaterials' | 'groupsets' | 'sizeCharts'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'categories', label: 'Danh mục xe', icon: Tags },
  { id: 'brands', label: 'Thương hiệu', icon: Award },
  { id: 'brakeTypes', label: 'Loại phanh', icon: Disc },
  { id: 'frameMaterials', label: 'Chất liệu khung', icon: Layers },
  { id: 'groupsets', label: 'Groupset', icon: Layers },
  { id: 'sizeCharts', label: 'Size chart', icon: Ruler },
]

// ── generic ref-value panel (BrakeTypes & FrameMaterials) ─────────────────

interface RefValuePanelProps {
  items: ReferenceValue[]
  loading: boolean
  error: string | null
  onAdd: (name: string, description?: string) => Promise<void>
  onUpdate: (id: string, name: string, description?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function RefValuePanel({ items, loading, error, onAdd, onUpdate, onDelete }: RefValuePanelProps) {
  const [addName, setAddName] = useState('')
  const [addDesc, setAddDesc] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!addName.trim()) return
    setAdding(true)
    try {
      await onAdd(addName.trim(), addDesc.trim() || undefined)
      setAddName(''); setAddDesc(''); setShowAddForm(false)
    } finally { setAdding(false) }
  }

  const startEdit = (item: ReferenceValue) => {
    setEditId(item.id); setEditName(item.name); setEditDesc(item.description ?? '')
  }

  const handleEdit = async () => {
    if (!editId || !editName.trim()) return
    setActionId(editId)
    try {
      await onUpdate(editId, editName.trim(), editDesc.trim() || undefined)
      setEditId(null)
    } finally { setActionId(null) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa dữ liệu này?')) return
    setDeleteError(null)
    setActionId(id)
    try {
      await onDelete(id)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setDeleteError(msg || 'Không thể xóa. Dữ liệu đang được sử dụng.')
    } finally { setActionId(null) }
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}
      {deleteError && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{deleteError}</div>}

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-1" /> Thêm mới
        </Button>
      </div>

      {showAddForm && (
        <div className="flex gap-2 p-3 border rounded-lg bg-muted/30">
          <Input placeholder="Tên" value={addName} onChange={(e) => setAddName(e.target.value)} className="flex-1" />
          <Input placeholder="Mô tả (không bắt buộc)" value={addDesc} onChange={(e) => setAddDesc(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={handleAdd} disabled={adding || !addName.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setAddName(''); setAddDesc('') }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">Chưa có dữ liệu. Nhấn "Thêm mới" để bắt đầu.</p>
      ) : (
        <div className="divide-y divide-border border rounded-lg overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
              {editId === item.id ? (
                <>
                  <div className="flex-1 flex gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                    <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Mô tả" className="flex-1" />
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={handleEdit} disabled={actionId === item.id}>
                      {actionId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} disabled={actionId === item.id}>
                      {actionId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
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

// ── brands panel ───────────────────────────────────────────────────────────

interface BrandsPanelProps { brands: Brand[]; loading: boolean; error: string | null; onRefresh: () => void }

function BrandsPanel({ brands, loading, error, onRefresh }: BrandsPanelProps) {
  const [addName, setAddName] = useState('')
  const [addLogo, setAddLogo] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editLogo, setEditLogo] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!addName.trim()) return
    setAdding(true)
    try {
      await referenceDataApi.createBrand({ name: addName.trim(), logoUrl: addLogo.trim() || undefined })
      setAddName(''); setAddLogo(''); setShowAddForm(false); onRefresh()
    } finally { setAdding(false) }
  }

  const handleEdit = async () => {
    if (!editId || !editName.trim()) return
    setActionId(editId)
    try {
      await referenceDataApi.updateBrand(editId, { name: editName.trim(), logoUrl: editLogo.trim() || undefined })
      setEditId(null); onRefresh()
    } finally { setActionId(null) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa thương hiệu này?')) return
    setDeleteError(null)
    setActionId(id)
    try {
      await referenceDataApi.deleteBrand(id); onRefresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setDeleteError(msg || 'Không thể xóa. Thương hiệu đang được sử dụng.')
    } finally { setActionId(null) }
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}
      {deleteError && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{deleteError}</div>}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddForm(true)} disabled={showAddForm}><Plus className="h-4 w-4 mr-1" /> Thêm mới</Button>
      </div>
      {showAddForm && (
        <div className="flex gap-2 p-3 border rounded-lg bg-muted/30">
          <Input placeholder="Tên thương hiệu" value={addName} onChange={(e) => setAddName(e.target.value)} className="flex-1" />
          <Input placeholder="URL logo (không bắt buộc)" value={addLogo} onChange={(e) => setAddLogo(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={handleAdd} disabled={adding || !addName.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setAddName(''); setAddLogo('') }}><X className="h-4 w-4" /></Button>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : brands.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">Chưa có thương hiệu nào.</p>
      ) : (
        <div className="divide-y divide-border border rounded-lg overflow-hidden">
          {brands.map((brand) => (
            <div key={brand.id} className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
              {editId === brand.id ? (
                <>
                  <div className="flex-1 flex gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                    <Input value={editLogo} onChange={(e) => setEditLogo(e.target.value)} placeholder="URL logo" className="flex-1" />
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={handleEdit} disabled={actionId === brand.id}>
                      {actionId === brand.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="h-8 w-8 object-contain rounded border bg-white p-0.5 shrink-0" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <div className="h-8 w-8 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">🚲</div>
                    )}
                    <p className="font-medium text-sm truncate">{brand.name}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => { setEditId(brand.id); setEditName(brand.name); setEditLogo(brand.logoUrl ?? '') }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(brand.id)} disabled={actionId === brand.id}>
                      {actionId === brand.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
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

// ── categories panel ───────────────────────────────────────────────────────

interface CategoriesPanelProps { categories: Category[]; loading: boolean; error: string | null; onRefresh: () => void }

function CategoriesPanel({ categories, loading, error, onRefresh }: CategoriesPanelProps) {
  const [addName, setAddName] = useState('')
  const [addSlug, setAddSlug] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!addName.trim() || !addSlug.trim()) return
    setAdding(true)
    try {
      await referenceDataApi.createCategory({ name: addName.trim(), slug: addSlug.trim() })
      setAddName(''); setAddSlug(''); setShowAddForm(false); onRefresh()
    } finally { setAdding(false) }
  }

  const handleEdit = async () => {
    if (!editId || !editName.trim() || !editSlug.trim()) return
    setActionId(editId)
    try {
      await referenceDataApi.updateCategory(editId, { name: editName.trim(), slug: editSlug.trim() })
      setEditId(null); onRefresh()
    } finally { setActionId(null) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa danh mục này?')) return
    setDeleteError(null)
    setActionId(id)
    try {
      await referenceDataApi.deleteCategory(id); onRefresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setDeleteError(msg || 'Không thể xóa. Danh mục đang được sử dụng.')
    } finally { setActionId(null) }
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}
      {deleteError && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{deleteError}</div>}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddForm(true)} disabled={showAddForm}><Plus className="h-4 w-4 mr-1" /> Thêm mới</Button>
      </div>
      {showAddForm && (
        <div className="flex gap-2 p-3 border rounded-lg bg-muted/30">
          <Input placeholder="Tên danh mục" value={addName} onChange={(e) => setAddName(e.target.value)} className="flex-1" />
          <Input placeholder="Slug (vd: road-bike)" value={addSlug} onChange={(e) => setAddSlug(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={handleAdd} disabled={adding || !addName.trim() || !addSlug.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setAddName(''); setAddSlug('') }}><X className="h-4 w-4" /></Button>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : categories.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">Chưa có danh mục nào.</p>
      ) : (
        <div className="divide-y divide-border border rounded-lg overflow-hidden">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
              {editId === cat.id ? (
                <>
                  <div className="flex-1 flex gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                    <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="Slug" className="flex-1" />
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={handleEdit} disabled={actionId === cat.id}>
                      {actionId === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">/{cat.slug}{cat.parentName ? ` · Thuộc: ${cat.parentName}` : ''}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditSlug(cat.slug) }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id)} disabled={actionId === cat.id}>
                      {actionId === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
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

// ── main page ──────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('categories')

  // Data state
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [brakeTypes, setBrakeTypes] = useState<ReferenceValue[]>([])
  const [frameMaterials, setFrameMaterials] = useState<ReferenceValue[]>([])
  const [groupsets, setGroupsets] = useState<ReferenceValue[]>([])
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([])

  // Loading/error per tab
  const [tabLoading, setTabLoading] = useState<Record<TabId, boolean>>({
    categories: false, brands: false, brakeTypes: false, frameMaterials: false, groupsets: false, sizeCharts: false,
  })
  const [tabError, setTabError] = useState<Record<TabId, string | null>>({
    categories: null, brands: null, brakeTypes: null, frameMaterials: null, groupsets: null, sizeCharts: null,
  })

  const setLoading = (tab: TabId, v: boolean) => setTabLoading((p) => ({ ...p, [tab]: v }))
  const setError = (tab: TabId, v: string | null) => setTabError((p) => ({ ...p, [tab]: v }))

  // Fetch functions
  const fetchCategories = useCallback(async () => {
    setLoading('categories', true); setError('categories', null)
    try { setCategories(await referenceDataApi.getCategories()) }
    catch { setError('categories', 'Không thể tải danh mục.') }
    finally { setLoading('categories', false) }
  }, [])

  const fetchBrands = useCallback(async () => {
    setLoading('brands', true); setError('brands', null)
    try { setBrands(await referenceDataApi.getBrands()) }
    catch { setError('brands', 'Không thể tải thương hiệu.') }
    finally { setLoading('brands', false) }
  }, [])

  const fetchBrakeTypes = useCallback(async () => {
    setLoading('brakeTypes', true); setError('brakeTypes', null)
    try { setBrakeTypes(await referenceDataApi.getBrakeTypes()) }
    catch { setError('brakeTypes', 'Không thể tải loại phanh.') }
    finally { setLoading('brakeTypes', false) }
  }, [])

  const fetchFrameMaterials = useCallback(async () => {
    setLoading('frameMaterials', true); setError('frameMaterials', null)
    try { setFrameMaterials(await referenceDataApi.getFrameMaterials()) }
    catch { setError('frameMaterials', 'Không thể tải chất liệu khung.') }
    finally { setLoading('frameMaterials', false) }
  }, [])

  const fetchGroupsets = useCallback(async () => {
    setLoading('groupsets', true); setError('groupsets', null)
    try { setGroupsets(await referenceDataApi.getGroupsets()) }
    catch { setError('groupsets', 'Không thể tải groupset.') }
    finally { setLoading('groupsets', false) }
  }, [])

  const fetchSizeCharts = useCallback(async () => {
    setLoading('sizeCharts', true); setError('sizeCharts', null)
    try {
      const [loadedCharts, loadedCategories] = await Promise.all([
        referenceDataApi.getAdminSizeCharts(),
        referenceDataApi.getCategories(),
      ])
      setSizeCharts(loadedCharts)
      setCategories(loadedCategories)
    } catch {
      setError('sizeCharts', 'Không thể tải size chart.')
    } finally { setLoading('sizeCharts', false) }
  }, [])

  // Load when tab changes
  useEffect(() => {
    if (activeTab === 'categories') fetchCategories()
    if (activeTab === 'brands') fetchBrands()
    if (activeTab === 'brakeTypes') fetchBrakeTypes()
    if (activeTab === 'frameMaterials') fetchFrameMaterials()
    if (activeTab === 'groupsets') fetchGroupsets()
    if (activeTab === 'sizeCharts') fetchSizeCharts()
  }, [activeTab, fetchCategories, fetchBrands, fetchBrakeTypes, fetchFrameMaterials, fetchGroupsets, fetchSizeCharts])

  // BrakeType CRUD wrappers
  const btHandlers = {
    onAdd: async (name: string, description?: string) => {
      await referenceDataApi.createBrakeType({ name, description })
      fetchBrakeTypes()
    },
    onUpdate: async (id: string, name: string, description?: string) => {
      await referenceDataApi.updateBrakeType(id, { name, description })
      fetchBrakeTypes()
    },
    onDelete: async (id: string) => {
      await referenceDataApi.deleteBrakeType(id)
      fetchBrakeTypes()
    },
  }

  // FrameMaterial CRUD wrappers
  const fmHandlers = {
    onAdd: async (name: string, description?: string) => {
      await referenceDataApi.createFrameMaterial({ name, description })
      fetchFrameMaterials()
    },
    onUpdate: async (id: string, name: string, description?: string) => {
      await referenceDataApi.updateFrameMaterial(id, { name, description })
      fetchFrameMaterials()
    },
    onDelete: async (id: string) => {
      await referenceDataApi.deleteFrameMaterial(id)
      fetchFrameMaterials()
    },
  }

  const gsHandlers = {
    onAdd: async (name: string, description?: string) => {
      await referenceDataApi.createGroupset({ name, description })
      fetchGroupsets()
    },
    onUpdate: async (id: string, name: string, description?: string) => {
      await referenceDataApi.updateGroupset(id, { name, description })
      fetchGroupsets()
    },
    onDelete: async (id: string) => {
      await referenceDataApi.deleteGroupset(id)
      fetchGroupsets()
    },
  }

  const scHandlers = {
    onAdd: async (request: Parameters<typeof referenceDataApi.createSizeChart>[0]) => {
      await referenceDataApi.createSizeChart(request)
      fetchSizeCharts()
    },
    onUpdate: async (id: string, request: Parameters<typeof referenceDataApi.updateSizeChart>[1]) => {
      await referenceDataApi.updateSizeChart(id, request)
      fetchSizeCharts()
    },
    onDelete: async (id: string) => {
      await referenceDataApi.deleteSizeChart(id)
      fetchSizeCharts()
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Quản lý dữ liệu danh mục</h2>
        <p className="text-muted-foreground">Quản lý danh mục, thương hiệu và thông số kỹ thuật xe đạp.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'categories' && (
          <CategoriesPanel
            categories={categories}
            loading={tabLoading.categories}
            error={tabError.categories}
            onRefresh={fetchCategories}
          />
        )}
        {activeTab === 'brands' && (
          <BrandsPanel
            brands={brands}
            loading={tabLoading.brands}
            error={tabError.brands}
            onRefresh={fetchBrands}
          />
        )}
        {activeTab === 'brakeTypes' && (
          <RefValuePanel
            items={brakeTypes}
            loading={tabLoading.brakeTypes}
            error={tabError.brakeTypes}
            {...btHandlers}
          />
        )}
        {activeTab === 'frameMaterials' && (
          <RefValuePanel
            items={frameMaterials}
            loading={tabLoading.frameMaterials}
            error={tabError.frameMaterials}
            {...fmHandlers}
          />
        )}
        {activeTab === 'groupsets' && (
          <RefValuePanel
            items={groupsets}
            loading={tabLoading.groupsets}
            error={tabError.groupsets}
            {...gsHandlers}
          />
        )}
        {activeTab === 'sizeCharts' && (
          <AdminSizeChartsPanel
            charts={sizeCharts}
            categories={categories}
            loading={tabLoading.sizeCharts}
            error={tabError.sizeCharts}
            {...scHandlers}
          />
        )}
      </div>
    </div>
  )
}
