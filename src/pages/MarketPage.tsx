import { type ReactNode, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bikes, categories, conditions } from '@/data/bikes'
import { buildRoute, ROUTES } from '@/constants/routes'
import { formatCurrencyInput, formatPriceDisplay, parseCurrencyInput } from '@/lib/currency-input'

const conditionOptions = ['all', 'new', 'used', 'need_repair'] as const
const PAGE_SIZE = 6
const skeletonCardKeys = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5', 'skeleton-6'] as const

const priceStepCandidates = [1_000_000, 2_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000] as const

function getRoundedPriceStep(minPrice: number, maxPrice: number) {
  const targetStep = Math.max(maxPrice - minPrice, 1) / 4

  return priceStepCandidates.find((step) => step >= targetStep) ?? priceStepCandidates.at(-1) ?? 50_000_000
}

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

const bikePrices = bikes.map((bike) => bike.price)
const rawMinBikePrice = Math.min(...bikePrices)
const rawMaxBikePrice = Math.max(...bikePrices)
const priceLevelStep = getRoundedPriceStep(rawMinBikePrice, rawMaxBikePrice)
const priceSliderMin = Math.floor(rawMinBikePrice / priceLevelStep) * priceLevelStep
const priceSliderMax = Math.ceil(rawMaxBikePrice / priceLevelStep) * priceLevelStep
const priceLevelMarks = Array.from(
  { length: Math.floor((priceSliderMax - priceSliderMin) / priceLevelStep) + 1 },
  (_, index) => priceSliderMin + index * priceLevelStep,
)

type ConditionOption = typeof conditionOptions[number]

interface FilteredBike {
  id: string
  title: string
  brand: string
  category: string
  condition: ConditionOption
  price: number
  location: string
  year: string
  wheelSize: string
  images: string[]
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
        className="flex w-full items-center justify-between rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-left transition hover:border-black hover:bg-white"
      >
        <span>
          <span className="block text-sm font-medium text-slate-700">{title}</span>
          <span className="mt-1 block text-sm text-slate-500">{selectedLabel}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="mt-2 space-y-1">{children}</div>}
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

function BikeCard({ bike, viewMode }: Readonly<{ bike: FilteredBike; viewMode: 'grid' | 'list' }>) {
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
        {bike.images[0] ? (
          <img
            src={bike.images[0]}
            alt={bike.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Grid3X3 className="h-8 w-8 text-slate-400" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          {bike.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col space-y-4 p-6">
        <div>
          <p className="text-xs text-slate-500">{bike.brand}</p>
          <h3 className="line-clamp-1 text-lg font-semibold text-slate-950 transition group-hover:text-sky-600">
            {bike.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{bike.location}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-slate-50 p-2">
            <p className="font-medium text-slate-700">Tình trạng</p>
            <p className="text-xs text-slate-600 mt-1">{conditions[bike.condition]}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2">
            <p className="font-medium text-slate-700">Kích thước</p>
            <p className="text-xs text-slate-600 mt-1">{bike.wheelSize}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3 mt-auto">
          <p className="rounded-xl border border-sky-400 bg-sky-50 px-3 py-1 text-lg font-semibold text-sky-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bike.price)}
          </p>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            {bike.year}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function MarketPage() {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('all')
  const [condition, setCondition] = useState<ConditionOption>('all')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isConditionOpen, setIsConditionOpen] = useState(false)
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [page, setPage] = useState(0)
  const isLoading = false
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const minPrice = parseCurrencyInput(minPriceInput)
  const maxPrice = parseCurrencyInput(maxPriceInput)

  const normalizedPriceRange = useMemo(() => getNormalizedPriceRange(minPrice, maxPrice), [maxPrice, minPrice])

  const isPriceFilterActive =
    normalizedPriceRange.min !== null || normalizedPriceRange.max !== null

  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      const searchStr = [
        bike.title, 
        bike.brand, 
        bike.brandName, 
        bike.category, 
        bike.categoryName, 
        bike.location, 
        bike.province, 
        bike.district
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = searchStr.includes(search.toLowerCase())

      const matchesCategory = category === 'all' || 
        bike.category === category || 
        bike.categoryName === category || 
        bike.categoryId === category
      
      const matchesCondition = condition === 'all' || bike.condition === condition
      const matchesMinPrice = normalizedPriceRange.min === null || bike.price >= normalizedPriceRange.min
      const matchesMaxPrice = normalizedPriceRange.max === null || bike.price <= normalizedPriceRange.max

      return matchesSearch && matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice
    })
  }, [search, category, condition, normalizedPriceRange])


  const paginatedBikes = useMemo(() => {
    const start = page * PAGE_SIZE
    return filteredBikes.slice(start, start + PAGE_SIZE)
  }, [filteredBikes, page])

  const totalPages = Math.ceil(filteredBikes.length / PAGE_SIZE)

  const handleSearchSubmit = () => {
    setPage(0)
    setSearch(searchInput.trim())
  }

  const handleCategoryChange = (newCategory: string) => {
    setPage(0)
    setCategory(newCategory)
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
    setCondition('all')
    setMinPriceInput('')
    setMaxPriceInput('')
    setPage(0)
  }

  const activeFiltersCount =
    (search ? 1 : 0) +
    (category === 'all' ? 0 : 1) +
    (condition === 'all' ? 0 : 1) +
    (isPriceFilterActive ? 1 : 0)

  const priceRangeLabel = useMemo(
    () => getPriceRangeLabel(normalizedPriceRange, isPriceFilterActive),
    [isPriceFilterActive, normalizedPriceRange],
  )

  const selectedCategoryLabel = category === 'all' ? 'Tất cả' : category
  const selectedConditionLabel = condition === 'all' ? 'Tất cả' : conditions[condition]

  const filterContent = (
    <div className="space-y-4">
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
              ? 'border-black bg-sky-500/10 text-slate-900 font-medium'
              : 'border-black bg-white text-slate-700 hover:border-black hover:bg-slate-50'
          }`}
        >
          Tất cả
        </button>
        {categories.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleCategoryChange(option)}
            className={`w-full rounded-2xl border-2 px-3 py-2 text-left text-sm transition ${
              category === option
                ? 'border-black bg-sky-500/10 text-slate-900 font-medium'
                : 'border-black bg-white text-slate-700 hover:border-black hover:bg-slate-50'
            }`}
          >
            {option}
          </button>
        ))}
      </CollapsibleFilterSection>

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
              className={`w-full rounded-2xl border-2 px-3 py-2 text-left text-sm transition ${
                condition === option
                  ? 'border-black bg-sky-500/10 text-slate-900 font-medium'
                  : 'border-black bg-white text-slate-700 hover:border-black hover:bg-slate-50'
              }`}
            >
              {option === 'all' ? 'Tất cả' : conditions[option]}
            </button>
          ))}
        </CollapsibleFilterSection>
      </div>

      <div className="border-t-2 border-black pt-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Khoảng giá</p>
        <div className="rounded-2xl border-2 border-black bg-slate-50 p-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <input
              type="text"
              inputMode="numeric"
              list="market-price-suggestions"
              value={minPriceInput}
              onChange={(event) => handleMinPriceChange(event.target.value)}
              placeholder="Giá từ"
              className="w-full rounded-2xl border-2 border-black bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-black focus:ring-2 focus:ring-black/20"
            />
            <input
              type="text"
              inputMode="numeric"
              list="market-price-suggestions"
              value={maxPriceInput}
              onChange={(event) => handleMaxPriceChange(event.target.value)}
              placeholder="Giá đến"
              className="w-full rounded-2xl border-2 border-black bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-black focus:ring-2 focus:ring-black/20"
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
                  className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-black hover:bg-slate-100 hover:text-slate-900"
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
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600"></p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Mua xe đạp thể thao đúng nhu cầu
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Duyệt tin đăng đáng tin cậy, so sánh giá và tiếp cận người bán nhanh chóng.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
              <Link to={ROUTES.SELL}>Đăng tin bán xe</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-100">
              <Link to={ROUTES.HOME}>Trở về trang chủ</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 h-fit sticky top-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Bộ lọc</h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 transition"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            {filterContent}
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5">
              <div className="mb-6 flex flex-col gap-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Tìm kiếm xe đạp..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSearchSubmit()}
                    className="w-full rounded-2xl border-2 border-black bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSearchSubmit}
                      className="bg-sky-600 text-white hover:bg-sky-700"
                    >
                      Tìm kiếm
                    </Button>
                    {activeFiltersCount > 0 && (
                      <span className="text-sm text-slate-600">
                        {filteredBikes.length} kết quả
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1 lg:hidden">
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Bộ lọc
                    </button>
                  </div>

                  <div className="hidden sm:flex gap-1 items-center rounded-2xl border border-slate-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition ${
                        viewMode === 'grid'
                          ? 'bg-sky-100 text-sky-600'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Grid view"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition ${
                        viewMode === 'list'
                          ? 'bg-sky-100 text-sky-600'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                    {search && (
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
                    )}
                    {category !== 'all' && (
                      <div className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        <span>Danh mục: {category}</span>
                        <button
                          onClick={() => handleCategoryChange('all')}
                          className="hover:text-sky-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {condition !== 'all' && (
                      <div className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        <span>Tình trạng: {conditions[condition]}</span>
                        <button
                          onClick={() => handleConditionChange('all')}
                          className="hover:text-sky-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {priceRangeLabel && (
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
                    )}
                  </div>
                )}
              </div>
            </div>

            {filteredBikes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm shadow-slate-900/5">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Không tìm thấy xe phù hợp</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Thử thay đổi từ khóa hoặc chọn mục khác để tìm thêm tin đăng.
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-4 border-slate-300 text-slate-900 hover:bg-slate-100"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
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
                    : paginatedBikes.map((bike) => (
                        <BikeCard
                          key={bike.id}
                          bike={bike as FilteredBike}
                          viewMode={viewMode}
                        />
                      ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      onClick={() => {
                        setPage((p) => Math.max(0, p - 1))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={page === 0}
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
                      disabled={page >= totalPages - 1}
                      variant="outline"
                      className="border-slate-300 text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Tiếp
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
