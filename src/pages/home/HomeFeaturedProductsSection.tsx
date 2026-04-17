import { ArrowRight, Bike, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ROUTES, buildRoute } from '@/constants/routes'
import type { Product } from '@/types/product'
import {
  formatPrice,
  getPrimaryImage,
  getProductConditionLabel,
  getProductLocation,
} from './home.utils'

interface HomeFeaturedProductsSectionProps {
  products: Product[]
  loading: boolean
}

function FeaturedBikeSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-slate-100" />
      <CardContent className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-slate-100" />
      </CardContent>
      <CardFooter className="border-t px-4 py-3">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
      </CardFooter>
    </Card>
  )
}

function ProductPreviewImage({ imageUrl, title }: { imageUrl: string; title: string }) {
  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Bike className="h-10 w-10 opacity-60" />
          <span className="text-xs font-medium">Chưa có ảnh xe</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={title}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  )
}

export function HomeFeaturedProductsSection({
  products,
  loading,
}: HomeFeaturedProductsSectionProps) {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Xe mới cập nhật
            </h2>
          </div>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link to={ROUTES.MARKET}>
              Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <FeaturedBikeSkeleton key={index} />)
          ) : products.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-100 px-6 py-12 text-center text-slate-500">
              Hiện chưa có xe công khai nào phù hợp để hiển thị ở trang chủ.
            </div>
          ) : (
            products.map((product) => {
              const conditionLabel = getProductConditionLabel(product.condition)

              return (
                <Link key={product.id} to={buildRoute.bikeDetail(product.id)}>
                  <Card className="group h-full cursor-pointer overflow-hidden border-slate-300 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <ProductPreviewImage
                        imageUrl={getPrimaryImage(product)}
                        title={product.title}
                      />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {conditionLabel ? <Badge variant="secondary" className="bg-green-100 text-green-800">{conditionLabel}</Badge> : null}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="line-clamp-1 font-semibold text-slate-900 transition-colors group-hover:text-sky-500">
                        {product.title}
                      </h3>
                      <p className="mt-2 text-lg font-bold text-sky-500">
                        {formatPrice(product.price)}
                      </p>
                    </CardContent>

                    <CardFooter className="border-t px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="h-3.5 w-3.5" />
                        {getProductLocation(product)}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}