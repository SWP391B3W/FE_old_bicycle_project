import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Package, Star, User } from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { reviewApi, type Review } from '@/api/review.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/types/product'
import { Loader2 } from 'lucide-react'
import { getResult } from '@/lib/http'

interface PublicUser {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  joinedDate: string
  role: string
  averageRating?: number
  totalReviews?: number
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      void loadPublicProfile()
    }
  }, [userId])

  async function loadPublicProfile() {
    setLoading(true)
    try {
      const [userResult, productsResult, reviewsResult] = await Promise.all([
        getResult<PublicUser>(`/api/users/${userId}/public`).catch(() => null),
        productsApi.search({ sellerId: userId, size: 50 }),
        reviewApi.getSellerReviews(userId!).catch(() => ({ content: [] }))
      ])

      if (userResult) {
        setUser(userResult)
      } else if (productsResult.content.length > 0) {
        const firstProd = productsResult.content[0]
        setUser({
          id: userId!,
          firstName: firstProd.sellerName?.split(' ')[0] || 'User',
          lastName: firstProd.sellerName?.split(' ').slice(1).join(' ') || '',
          joinedDate: 'N/A',
          role: 'seller'
        })
      }

      setProducts(productsResult.content)
      setReviews(reviewsResult.content || [])
    } catch (error) {
      console.error('Failed to load public profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!user && !loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy người dùng</h2>
        <p className="mt-2 text-muted-foreground">Người dùng này có thể không tồn tại hoặc đã bị khóa.</p>
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header Profile */}
      <div className="bg-background border-b border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-4xl">
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <h1 className="text-3xl font-bold text-foreground">
                  {user?.firstName} {user?.lastName}
                </h1>
                {user?.role === 'seller' && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                    Người bán uy tín
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground md:justify-start">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Đã tham gia: {user?.joinedDate && user.joinedDate !== 'N/A' 
                    ? new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date(user.joinedDate))
                    : 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {(user?.averageRating ?? averageRating).toFixed(1)} ({(user?.totalReviews ?? reviews.length)} đánh giá)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-10 px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cột trái: Thông số & Review rút gọn */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thống kê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tin đăng đang bán</span>
                  <span className="font-bold">{products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tỷ lệ phản hồi</span>
                  <span className="font-bold">100%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Đánh giá mới nhất</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">Chưa có đánh giá nào.</p>
                ) : (
                  reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="space-y-1">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium line-clamp-2 italic">"{review.comment}"</p>
                      <p className="text-xs text-muted-foreground">— {review.buyerName}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cột phải: Danh sách xe đang rao bán */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Xe đang rao bán
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-20 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Người dùng này chưa có xe nào đang rao bán.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
