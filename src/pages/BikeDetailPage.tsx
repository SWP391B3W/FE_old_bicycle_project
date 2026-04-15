import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { bikes, conditions } from '@/data/bikes'
import { ROUTES, buildRoute } from '@/constants/routes'

export default function BikeDetailPage() {
  const { id } = useParams<{ id: string }>()

  const bike = useMemo(
    () => bikes.find((item) => item.id === id),
    [id],
  )

  if (!bike) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-950">Tin đăng không tồn tại</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Bạn có thể quay lại trang thị trường để chọn tin đăng khác.
          </p>
          <Button asChild className="mt-6 bg-slate-950 text-white hover:bg-slate-800">
            <Link to={ROUTES.MARKET}>Quay lại thị trường</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto grid gap-8 xl:grid-cols-[1.5fr_0.8fr]">
        <section className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                {bike.category}
              </span>
              <Link to={ROUTES.MARKET} className="text-sm font-medium text-sky-600 hover:text-sky-500">
                ← Quay lại thị trường
              </Link>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{bike.title}</h1>
            <p className="text-sm text-slate-600">{bike.location} • {bike.year}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="overflow-hidden rounded-3xl bg-slate-100">
              <img src={bike.image} alt={bike.title} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">Giá</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bike.price)}
                </p>
              </div>
              <div className="grid gap-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5">
                  <p className="font-medium text-slate-900">Tình trạng</p>
                  <p className="mt-1">{conditions[bike.condition]}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5">
                  <p className="font-medium text-slate-900">Kích thước</p>
                  <p className="mt-1">{bike.wheelSize}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button asChild className="w-full bg-sky-600 text-white hover:bg-sky-500 h-11">
                  <Link to={buildRoute.checkout(bike.id)}>Mua ngay</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-slate-300 h-11">
                  <Link to={ROUTES.SELL}>Đăng tin bán tương tự</Link>
                </Button>
              </div>
            </div>
          </div>

          <article className="rounded-3xl border border-slate-200/80 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-950">Mô tả sản phẩm</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{bike.description}</p>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-950">Thông tin cơ bản</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Thương hiệu</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{bike.brand}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Loại xe</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{bike.category}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Năm sản xuất</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{bike.year}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Địa điểm</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{bike.location}</p>
              </div>
            </div>
          </article>
        </section>

        <aside className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/5">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Thông tin người bán</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Người đăng</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{bike.sellerName}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Được đăng từ</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{bike.sellerSince}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Tình trạng xe</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{conditions[bike.condition]}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
