import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { bikes, categories, conditions } from '@/data/bikes'
import { buildRoute, ROUTES } from '@/constants/routes'

const conditionOptions = ['all', 'new', 'used', 'need_repair'] as const

type ConditionOption = typeof conditionOptions[number]

export default function MarketPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [condition, setCondition] = useState<ConditionOption>('all')

  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      const matchesSearch = [bike.title, bike.brand, bike.category, bike.location]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesCategory = category === 'all' || bike.category === category
      const matchesCondition = condition === 'all' || bike.condition === condition

      return matchesSearch && matchesCategory && matchesCondition
    })
  }, [search, category, condition])

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Thị trường</p>
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
          <aside className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Bộ lọc</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Thu hẹp kết quả theo danh mục và tình trạng xe.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="market-search" className="mb-2 block text-sm font-medium text-slate-700">Tìm kiếm</label>
                <input
                  id="market-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm tên, thương hiệu, địa điểm"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label htmlFor="market-category" className="mb-2 block text-sm font-medium text-slate-700">Danh mục</label>
                <select
                  id="market-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Tình trạng</p>
                <div className="grid gap-2">
                  {conditionOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCondition(option)}
                      className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${
                        condition === option
                          ? 'border-sky-500 bg-sky-500/10 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {option === 'all' ? 'Tất cả' : conditions[option]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="flex flex-col gap-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-600">{filteredBikes.length} tin đăng phù hợp</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Kết quả tìm kiếm</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>Danh mục: {category === 'all' ? 'Tất cả' : category}</span>
                <span>•</span>
                <span>Tình trạng: {condition === 'all' ? 'Tất cả' : conditions[condition]}</span>
              </div>
            </div>

            {filteredBikes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-700 shadow-sm shadow-slate-900/5">
                <h3 className="text-xl font-semibold text-slate-900">Không tìm thấy xe phù hợp</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Thử thay đổi từ khóa hoặc chọn mục khác để tìm thêm tin đăng.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredBikes.map((bike) => (
                  <article key={bike.id} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img src={bike.images[0]} alt={bike.title} className="h-full w-full object-cover" />
                      <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        {bike.category}
                      </span>
                    </div>
                    <div className="space-y-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-950">{bike.title}</h3>
                          <p className="mt-2 text-sm text-slate-500">{bike.location} • {bike.year}</p>
                        </div>
                        <p className="text-right text-lg font-semibold text-slate-950">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bike.price)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="font-medium text-slate-900">Tình trạng</p>
                          <p className="mt-1">{conditions[bike.condition]}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="font-medium text-slate-900">Kích thước</p>
                          <p className="mt-1">{bike.wheelSize}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          to={buildRoute.bikeDetail(bike.id)}
                          className="inline-flex items-center rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
                        >
                          Xem chi tiết
                        </Link>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                          {conditions[bike.condition]}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
