import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { buildRoute } from '@/constants/routes'
import type { Category } from '@/types/reference-data'
import { getCategoryIcon } from './home.constants'

interface HomeCategoriesSectionProps {
  categories: Category[]
  loading: boolean
}

function CategorySkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      </CardContent>
    </Card>
  )
}

export function HomeCategoriesSection({ categories, loading }: HomeCategoriesSectionProps) {
  return (
    <section className="bg-slate-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Danh mục xe đạp</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <CategorySkeleton key={index} />)
          ) : categories.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed bg-white px-6 py-12 text-center text-slate-500">
              Chưa tải được danh mục. Bạn vẫn có thể xem toàn bộ xe ở trang mua xe.
            </div>
          ) : (
            categories.map((category) => (
              <Link key={category.id} to={buildRoute.market({ categoryId: category.id })}>
                <Card className="group cursor-pointer transition-all hover:border-sky-500/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-6">
                    <span className="text-4xl">{getCategoryIcon(category)}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 font-semibold text-slate-900 transition-colors group-hover:text-sky-500">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Mở bộ lọc và xem các xe thuộc danh mục này
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-sky-500" />
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}