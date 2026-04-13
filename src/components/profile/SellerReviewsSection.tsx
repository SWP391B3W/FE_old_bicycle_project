import { useEffect, useState } from 'react'
import { Loader2, MessageSquareReply, Star } from 'lucide-react'
import { reviewsApi } from '@/api/reviews.api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { Review } from '@/types/review'
import { cn } from '@/lib/utils'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            'h-4 w-4',
            value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
          )}
        />
      ))}
    </div>
  )
}

export function SellerReviewsSection({ sellerId }: { sellerId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [savingReviewId, setSavingReviewId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadReviews() {
      setLoading(true)

      try {
        const result = await reviewsApi.getSellerReviews(sellerId, 0, 20)

        if (!cancelled) {
          setReviews(result.content)
          setReplyDrafts(
            Object.fromEntries(
              result.content.map((review) => [review.id, review.sellerReply ?? '']),
            ),
          )
          setError(null)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getErrorMessage(requestError, 'Không thể tải danh sách đánh giá lúc này.'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadReviews()

    return () => {
      cancelled = true
    }
  }, [sellerId])

  async function handleReply(review: Review) {
    const draft = (replyDrafts[review.id] ?? '').trim()

    if (!draft) {
      setError('Vui lòng nhập phản hồi trước khi lưu.')
      return
    }

    setSavingReviewId(review.id)

    try {
      const updatedReview = await reviewsApi.reply(review.id, { reply: draft })

      setReviews((currentReviews) =>
        currentReviews.map((currentReview) =>
          currentReview.id === updatedReview.id ? updatedReview : currentReview,
        ),
      )
      setReplyDrafts((currentDrafts) => ({
        ...currentDrafts,
        [review.id]: updatedReview.sellerReply ?? draft,
      }))
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể lưu phản hồi cho đánh giá này.'))
    } finally {
      setSavingReviewId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá từ người mua</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải đánh giá...
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <p className="text-base font-medium text-foreground">Chưa có đánh giá nào cho gian hàng của bạn.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Khi buyer hoàn tất đơn và gửi đánh giá, nội dung sẽ xuất hiện ở đây để bạn theo dõi và phản hồi.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review, index) => {
              const currentReply = replyDrafts[review.id] ?? ''
              const isSaving = savingReviewId === review.id

              return (
                <div key={review.id} className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{review.reviewerName}</div>
                        <StarRating rating={review.rating} />
                        {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</div>
                  </div>

                  {review.sellerReply && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <MessageSquareReply className="h-4 w-4" />
                        Phản hồi hiện tại của bạn
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{review.sellerReply}</p>
                      {review.sellerRepliedAt && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Cập nhật lúc {formatDateTime(review.sellerRepliedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`reply-${review.id}`}>
                      {review.sellerReply ? 'Chỉnh sửa phản hồi' : 'Phản hồi với buyer'}
                    </Label>
                    <Textarea
                      id={`reply-${review.id}`}
                      rows={4}
                      placeholder="Ví dụ: cảm ơn bạn đã mua xe, nếu cần thêm hỗ trợ hay báo cáo kiểm định thì cứ nhắn lại..."
                      value={currentReply}
                      onChange={(event) =>
                        setReplyDrafts((currentDrafts) => ({
                          ...currentDrafts,
                          [review.id]: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => void handleReply(review)} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : review.sellerReply ? (
                        'Cập nhật phản hồi'
                      ) : (
                        'Gửi phản hồi'
                      )}
                    </Button>
                  </div>

                  {index < reviews.length - 1 && <Separator />}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
