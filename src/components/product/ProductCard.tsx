import { Link } from 'react-router-dom'
import { Bike, MapPin, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ROUTES, buildRoute } from '@/constants/routes'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
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

export function ProductCard({ product }: ProductCardProps) {
  const conditionLabel = product.condition === 'new' ? 'Mới' : 'Đã sử dụng'
  const imageUrl = product.images?.[0] 
    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) 
    : ''

  return (
    <div className="flex flex-col h-full">
      <Link to={buildRoute.bikeDetail(product.id)} className="flex-1">
        <Card className="group h-full cursor-pointer overflow-hidden border-slate-300 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-lg">
          <div className="relative aspect-[4/3] overflow-hidden">
            <ProductPreviewImage
              imageUrl={imageUrl}
              title={product.title}
            />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                {conditionLabel}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="line-clamp-1 font-semibold text-slate-900 transition-colors group-hover:text-sky-500">
              {product.title}
            </h3>
            <p className="mt-2 text-lg font-bold text-sky-500">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </p>
          </CardContent>

          <CardFooter className="border-t px-4 py-3 flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {product.locationName || 'Toàn quốc'}
            </div>
          </CardFooter>
        </Card>
      </Link>
      
      {/* Link tới Profile nằm ngoài Link tới Detail để tránh Nesting Link */}
      {product.sellerName && (
        <Link 
          to={buildRoute.publicProfile(product.sellerId!)}
          className="mt-2 flex items-center gap-1.5 px-1 text-xs text-muted-foreground hover:text-sky-600 transition-colors"
        >
          <User className="h-3 w-3" />
          Bán bởi: <span className="font-medium underline decoration-slate-300 underline-offset-2">{product.sellerName}</span>
        </Link>
      )}
    </div>
  )
}
