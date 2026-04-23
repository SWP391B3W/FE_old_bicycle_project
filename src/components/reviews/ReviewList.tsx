import { Star, MessageCircle, Reply, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Review } from '@/api/review.api';

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
  mode?: 'seller' | 'buyer';
}

export function ReviewList({ reviews, isLoading, mode = 'seller' }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          {mode === 'buyer' 
            ? 'Bạn chưa thực hiện đánh giá nào cho người bán nào.' 
            : 'Chưa có đánh giá nào từ khách hàng.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="group bg-card rounded-2xl border border-border p-6 transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  {mode === 'buyer' ? (
                    <span className="flex items-center gap-2">
                       Đánh giá cho: <span className="text-primary">{review.revieweeName}</span>
                    </span>
                  ) : (
                    review.reviewerName
                  )}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-3.5 w-3.5 fill-current",
                          star > review.rating && "text-muted stroke-muted fill-transparent"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(review.createdAt))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed pl-16">
            {review.comment}
          </p>

          {review.sellerReply && (
            <div className="mt-6 ml-16 p-4 rounded-xl bg-muted/50 border-l-4 border-primary/30 relative">
              <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                <Reply className="h-3 w-3" />
                Người bán phản hồi
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{review.sellerReply}"
              </p>
              <div className="text-[10px] text-muted-foreground mt-2 text-right uppercase tracking-tighter">
                {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(review.sellerRepliedAt!))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
