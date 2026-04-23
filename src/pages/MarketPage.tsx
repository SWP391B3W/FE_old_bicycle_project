import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { referenceDataApi } from '@/api/reference-data.api'
import { Button } from '@/components/ui/button'
import { buildRoute, ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'

import { formatCurrencyInput, formatPriceDisplay, parseCurrencyInput } from '@/lib/currency-input'
import { getPrimaryImage, getProductConditionLabel, getProductLocation } from '@/pages/home/home.utils'
import type { Product } from '@/types/product'
import type { Brand, Category } from '@/types/reference-data'

const conditionOptions = ['all', 'new', 'used', 'need_repair'] as const
const PAGE_SIZE = 6
const skeletonCardKeys = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5', 'skeleton-6'] as const
const priceLevelMarks = [0, 10_000_000, 20_000_000, 30_000_000, 40_000_000, 50_000_000] as const

type ConditionOption = typeof conditionOptions[number]

function formatCompactPriceLabel(price: number) {
  if (price === 0) {
    return '0'
  }

  if (price % 1_000_000 === 0) {
    return `${price / 1_000_000}tr`
  }

  return formatPriceDisplay(price)
}

function getNormalizedPriceRange(minPrice: number | null, maxPrice: number | null) {
  if (minPrice === null && maxPrice === null) {
    return { min: null, max: null }
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return { min: maxPrice, max: minPrice }
  }

  return { min: minPrice, max: maxPrice }
}

function getPriceRangeLabel(
  normalizedPriceRange: { min: number | null; max: number | null },
  isPriceFilterActive: boolean,
) {
  if (!isPriceFilterActive) {
    return ''
  }

  if (normalizedPriceRange.min !== null && normalizedPriceRange.max !== null) {
    return `${formatPriceDisplay(normalizedPriceRange.min)} - ${formatPriceDisplay(normalizedPriceRange.max)}`
  }

  if (normalizedPriceRange.min !== null) {
    return `Từ ${formatPriceDisplay(normalizedPriceRange.min)}`
  }

  if (normalizedPriceRange.max !== null) {
    return `Đến ${formatPriceDisplay(normalizedPriceRange.max)}`
  }

  return ''
}

function CollapsibleFilterSection({
  title,
  selectedLabel,
  isOpen,
  onToggle,
  children,
}: Readonly<{
  title: string
  selectedLabel: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}>) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-gradient-to-b from-white to-slate-50 px-4 py-3 text-left shadow-sm transition hover:border-sky-300 hover:shadow"
      >
        <span>
          <span className="block text-sm font-semibold text-slate-800">{title}</span>
          <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {selectedLabel}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform group-hover:text-sky-600 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen ? <div className="mt-2 space-y-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-2">{children}</div> : null}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
      <div className="h-56 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-6">
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-6 w-full animate-pulse rounded-lg bg-slate-200" />
        <div className="h-5 w-1/2 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  )
}

function BikeCard({ bike, viewMode }: Readonly<{ bike: Product; viewMode: 'grid' | 'list' }>) {
  const imageUrl = getPrimaryImage(bike)
  const categoryLabel = bike.categoryName ?? bike.category ?? 'Xe đạp'
  // const brandLabel = bike.brandName ?? bike.brand ?? 'Chưa cập nhật'
  const conditionLabel = getProductConditionLabel(bike.condition) ?? 'Chưa cập nhật'
  const locationLabel = getProductLocation(bike)

  return (
    <Link
      to={buildRoute.bikeDetail(bike.id)}
      className={`group overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm shadow-slate-900/5 transition hover:border-slate-400 hover:shadow-md hover:shadow-slate-900/10 ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          viewMode === 'grid' ? 'aspect-[4/3]' : 'w-48 shrink-0'
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={bike.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Grid3X3 className="h-8 w-8 text-slate-400" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          {categoryLabel}
        </span>
        {/* Verified badge */}
        <span
          title="Đã kiểm duyệt bởi Market Bike"
          className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white shadow-md shadow-emerald-900/30 ring-2 ring-white/80 transition-transform duration-200 group-hover:scale-105"
        >
          <ShieldCheck className="h-3 w-3" />
          Đã duyệt
        </span>
      </div>
      <div className="flex flex-1 flex-col space-y-4 p-6">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-950 transition group-hover:text-sky-600">
            {bike.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{locationLabel}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-slate-50 p-2">
            <p className="font-medium text-slate-700">Tình trạng</p>
            <p className="mt-1 text-xs text-slate-600">{conditionLabel}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2">
            <p className="font-medium text-slate-700">Kích thước</p>
            <p className="mt-1 text-xs text-slate-600">{bike.wheelSize ?? bike.frameSize ?? 'Chưa cập nhật'}</p>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
          <p className="rounded-xl border border-sky-400 bg-sky-50 px-3 py-1 text-lg font-semibold text-sky-600">
            {formatPriceDisplay(bike.price)}
          </p>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            {bike.createdAt ? new Intl.DateTimeFormat('vi-VN', { year: 'numeric' }).format(new Date(bike.createdAt)) : 'Mới'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function MarketPage() {
  const { isAuthenticated, user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('all')
  const [brand, setBrand] = useState('all')
  const [condition, setCondition] = useState<ConditionOption>('all')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isBrandOpen, setIsBrandOpen] = useState(false)
  const [isConditionOpen, setIsConditionOpen] = useState(false)
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const sellEntryHref = ROUTES.SELLER
  const sellEntryLabel = 'Quản lý cửa hàng'
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const minPrice = parseCurrencyInput(minPriceInput)
  const maxPrice = parseCurrencyInput(maxPriceInput)

  const normalizedPriceRange = useMemo(() => getNormalizedPriceRange(minPrice, maxPrice), [maxPrice, minPrice])

  const isPriceFilterActive =
    normalizedPriceRange.min !== null || normalizedPriceRange.max !== null

  useEffect(() => {
    let ignore = false

    async function loadCategories() {
      try {
        const result = await referenceDataApi.getCategories()

        if (!ignore) {
          setCategories(result)
        }
      } catch {
        if (!ignore) {
          setCategories([])
        }
      }
    }

    async function loadBrands() {
      try {
        const result = await referenceDataApi.getBrands()

        if (!ignore) {
          setBrands(result)
        }
      } catch {
        if (!ignore) {
          setBrands([])
        }
      }
    }

    void loadCategories()
    void loadBrands()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await productsApi.search({
          page,
          size: PAGE_SIZE,
          keyword: search || undefined,
          categoryId: category === 'all' ? undefined : category,
          brandId: brand === 'all' ? undefined : brand,
          condition: condition === 'all' ? undefined : condition,
          minPrice: normalizedPriceRange.min ?? undefined,
          maxPrice: normalizedPriceRange.max ?? undefined,
          sortBy: 'createdAt,desc',
        })

        if (!ignore) {
          setProducts(result.content)
          setTotalPages(result.totalPages)
          setTotalElements(result.totalElements)
        }
      } catch {
        if (!ignore) {
          setProducts([])
          setTotalPages(0)
          setTotalElements(0)
          setError('Không thể tải danh sách xe từ API. Vui lòng kiểm tra backend rồi thử lại.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      ignore = true
    }
  }, [brand, category, condition, normalizedPriceRange.max, normalizedPriceRange.min, page, search])

  const handleSearchSubmit = () => {
    setPage(0)
    setSearch(searchInput.trim())
  }

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(0)
      setSearch(value.trim())
    }, 500)
  }, [])

  const handleCategoryChange = (newCategory: string) => {
    setPage(0)
    setCategory(newCategory)
  }

  const handleBrandChange = (newBrand: string) => {
    setPage(0)
    setBrand(newBrand)
  }

  const handleConditionChange = (newCondition: ConditionOption) => {
    setPage(0)
    setCondition(newCondition)
  }

  const handleMinPriceChange = (value: string) => {
    setPage(0)
    setMinPriceInput(formatCurrencyInput(value))
  }

  const handleMaxPriceChange = (value: string) => {
    setPage(0)
    setMaxPriceInput(formatCurrencyInput(value))
  }

  const handleSuggestedPriceClick = (suggestionValue: string) => {
    if (!minPriceInput) {
      handleMinPriceChange(suggestionValue)
      return
    }

    if (!maxPriceInput) {
      handleMaxPriceChange(suggestionValue)
      return
    }

    handleMaxPriceChange(suggestionValue)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setCategory('all')
    setBrand('all')
    setCondition('all')
    setMinPriceInput('')
    setMaxPriceInput('')
    setPage(0)
  }

  const activeFiltersCount =
    (search ? 1 : 0) +
    (category === 'all' ? 0 : 1) +
    (brand === 'all' ? 0 : 1) +
    (condition === 'all' ? 0 : 1) +
    (isPriceFilterActive ? 1 : 0)

  const priceRangeLabel = useMemo(
    () => getPriceRangeLabel(normalizedPriceRange, isPriceFilterActive),
    [isPriceFilterActive, normalizedPriceRange],
  )

  const selectedCategoryLabel = category === 'all'
    ? 'Tất cả'
    : categories.find((item) => item.id === category)?.name ?? category

  const selectedBrandLabel = brand === 'all'
    ? 'Tất cả'
    : brands.find((item) => item.id === brand)?.name ?? brand

  const selectedConditionLabel = condition === 'all'
    ? 'Tất cả'
    : getProductConditionLabel(condition) ?? condition

  const filterContent = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-2 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Khám phá nhanh:</span> {categories.length} danh mục • {brands.length} thương hiệu
      </div>

      <CollapsibleFilterSection
        title="Danh mục"
        selectedLabel={selectedCategoryLabel}
        isOpen={isCategoryOpen}
        onToggle={() => setIsCategoryOpen((currentValue) => !currentValue)}
      >
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={`w-full rounded-2xl border-2 px-3 py-2 text-left text-sm transition ${
            category === 'all'
              ? 'border-black bg-sky-500/10 font-medium text-slate-900'
              : 'border-black bg-white text-slate-700 hover:border-black hover:bg-slate-50'
          }`}
        >
          Tất cả
        </button>
        {categories.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleCategoryChange(option.id)}
            className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition ${
              category === option.id
                ? 'border-sky-300 bg-sky-50 font-medium text-slate-900'
                : 'border-slate-300 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/40'
            }`}
          >
            <span>{option.name}</span>
            {category === option.id ? <Check className="h-4 w-4 text-sky-600" /> : null}
          </button>
        ))}
      </CollapsibleFilterSection>

      <div className="border-t-2 border-black pt-4">
        <CollapsibleFilterSection
          title="Thương hiệu"
          selectedLabel={selectedBrandLabel}
          isOpen={isBrandOpen}
          onToggle={() => setIsBrandOpen((currentValue) => !currentValue)}
        >
          <button
            type="button"
            onClick={() => handleBrandChange('all')}
            className={`w-full rounded-2xl border-2 px-3 py-2 text-left text-sm transition ${
              brand === 'all'
                ? 'border-black bg-sky-500/10 font-medium text-slate-900'
                : 'border-black bg-white text-slate-700 hover:border-black hover:bg-slate-50'
            }`}
          >
            Tất cả
          </button>
          {brands.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleBrandChange(option.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition ${
                brand === option.id
                  ? 'border-sky-300 bg-sky-50 font-medium text-slate-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/40'
              }`}
            >
              <span>{option.name}</span>
              {brand === option.id ? <Check className="h-4 w-4 text-sky-600" /> : null}
            </button>
          ))}
        </CollapsibleFilterSection>
      </div>

      <div className="border-t-2 border-black pt-4">
        <CollapsibleFilterSection
          title="Tình trạng"
          selectedLabel={selectedConditionLabel}
          isOpen={isConditionOpen}
          onToggle={() => setIsConditionOpen((currentValue) => !currentValue)}
        >
          {conditionOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleConditionChange(option)}
              className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition ${
                condition === option
                  ? 'border-sky-300 bg-sky-50 font-medium text-slate-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/40'
              }`}
            >
              <span>{option === 'all' ? 'Tất cả' : getProductConditionLabel(option) ?? option}</span>
              {condition === option ? <Check className="h-4 w-4 text-sky-600" /> : null}
            </button>
          ))}
        </CollapsibleFilterSection>
      </div>

      <div className="border-t-2 border-black pt-4">
        <p className="mb-2 text-sm font-semibold text-slate-800">Khoảng giá</p>
        <div className="rounded-2xl border border-slate-300 bg-gradient-to-b from-white to-slate-50 p-3 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <input
              type="text"
              inputMode="numeric"
              list="market-price-suggestions"
              value={minPriceInput}
              onChange={(event) => handleMinPriceChange(event.target.value)}
              placeholder="Giá từ"
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              type="text"
              inputMode="numeric"
              list="market-price-suggestions"
              value={maxPriceInput}
              onChange={(event) => handleMaxPriceChange(event.target.value)}
              placeholder="Giá đến"
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {priceLevelMarks.map((price) => {
              const suggestionValue = formatCurrencyInput(price)

              return (
                <button
                  key={price}
                  type="button"
                  onClick={() => handleSuggestedPriceClick(suggestionValue)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    suggestionValue === minPriceInput || suggestionValue === maxPriceInput
                      ? 'border-sky-300 bg-sky-50 text-sky-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/40 hover:text-slate-900'
                  }`}
                >
                  {formatCompactPriceLabel(price)}
                </button>
              )
            })}
          </div>

          <datalist id="market-price-suggestions">
            {priceLevelMarks.map((price) => (
              <option key={price} value={formatCurrencyInput(price)}>{formatCompactPriceLabel(price)}</option>
            ))}
          </datalist>
        </div>
        <p className="mt-2 text-xs text-slate-500">Bạn có thể nhập tự do hoặc chọn nhanh từ các mức giá gợi ý.</p>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Mua xe đạp thể thao đúng nhu cầu
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Duyệt tin đăng đáng tin cậy, so sánh giá và tiếp cận người bán nhanh chóng.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {isAuthenticated && user?.role === 'seller' ? (
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link to={sellEntryHref}>{sellEntryLabel}</Link>
              </Button>
            ) : !isAuthenticated ? (
              <Button asChild className="bg-sky-600 text-white hover:bg-sky-700">
                <Link to={ROUTES.SELL}>Bán xe của bạn</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="sticky top-6 hidden h-fit rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-900/5 ring-1 ring-slate-100 backdrop-blur lg:block">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Bộ lọc</h2>
                <p className="text-xs text-slate-500">Tùy chỉnh kết quả theo nhu cầu</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {activeFiltersCount} lọc
              </span>
              {activeFiltersCount > 0 ? (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-sky-600 transition hover:text-sky-700"
                >
                  Xóa tất cả
                </button>
              ) : null}
            </div>
            {filterContent}
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5">
              <div className="mb-6 flex flex-col gap-4">
                {/* Upgraded search bar — icon on right as clickable, debounce auto-search */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      id="market-search-input"
                      placeholder="Tìm kiếm xe đạp..."
                      value={searchInput}
                      onChange={(event) => handleSearchInputChange(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && handleSearchSubmit()}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-20 text-sm text-slate-900 outline-none ring-0 transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                      {searchInput ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInput('')
                            setSearch('')
                            setPage(0)
                          }}
                          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                          aria-label="Xóa tìm kiếm"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm transition hover:bg-sky-600 active:scale-95"
                        aria-label="Tìm kiếm"
                      >
                        <Search className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`rounded-xl p-2 transition ${
                        viewMode === 'grid'
                          ? 'bg-white text-sky-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Dạng lưới"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`rounded-xl p-2 transition ${
                        viewMode === 'list'
                          ? 'bg-white text-sky-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Dạng danh sách"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex gap-1 lg:hidden">
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Bộ lọc
                    </button>
                  </div>
                </div>

                {/* Result count + status row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: '0ms' }} />
                        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: '150ms' }} />
                        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: '300ms' }} />
                        Đang tải...
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        {totalElements > 0
                          ? <><span className="font-semibold text-slate-800">{totalElements}</span> xe được tìm thấy</>
                          : 'Không có kết quả'}
                      </span>
                    )}
                  </div>
                </div>

                {activeFiltersCount > 0 ? (
                  <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-2">
                    {search ? (
                      <div className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        <span>Từ khóa: {search}</span>
                        <button
                          onClick={() => {
                            setSearchInput('')
                            setSearch('')
                            setPage(0)
                          }}
                          className="hover:text-sky-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    {category !== 'all' ? (
                      <div className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        <span>Danh mục: {selectedCategoryLabel}</span>
                        <button
                          onClick={() => handleCategoryChange('all')}
                          className="hover:text-sky-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    {brand !== 'all' ? (
                      <div className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        <span>Thương hiệu: {selectedBrandLabel}</span>
                        <button
                          onClick={() => handleBrandChange('all')}
                          className="hover:text-sky-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    {condition !== 'all' ? (
                      <div className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        <span>Tình trạng: {selectedConditionLabel}</span>
                        <button
                          onClick={() => handleConditionChange('all')}
                          className="hover:text-sky-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    {priceRangeLabel ? (
                      <div className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        <span>Giá: {priceRangeLabel}</span>
                        <button
                          onClick={() => {
                            setMinPriceInput('')
                            setMaxPriceInput('')
                            setPage(0)
                          }}
                          className="hover:text-sky-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {error ? (
              <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {!isLoading && products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm shadow-slate-900/5">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Không tìm thấy xe phù hợp</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Thử thay đổi từ khóa hoặc chọn mục khác để tìm thêm tin đăng.
                </p>
                {activeFiltersCount > 0 ? (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-4 border-slate-300 text-slate-900 hover:bg-slate-100"
                  >
                    Xóa bộ lọc
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'sm:grid-cols-2 lg:grid-cols-2'
                      : 'grid-cols-1'
                  }`}
                >
                  {isLoading
                    ? skeletonCardKeys.map((key) => <SkeletonCard key={key} />)
                    : products.map((bike) => (
                        <BikeCard
                          key={bike.id}
                          bike={bike}
                          viewMode={viewMode}
                        />
                      ))}
                </div>

                {totalPages > 1 ? (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      onClick={() => {
                        setPage((p) => Math.max(0, p - 1))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={page === 0 || isLoading}
                      variant="outline"
                      className="border-slate-300 text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Trước
                    </Button>
                    <span className="text-sm text-slate-600">
                      Trang {page + 1} / {totalPages}
                    </span>
                    <Button
                      onClick={() => {
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={page >= totalPages - 1 || isLoading}
                      variant="outline"
                      className="border-slate-300 text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Tiếp
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
