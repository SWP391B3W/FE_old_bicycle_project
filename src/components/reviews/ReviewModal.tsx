// @ts-nocheck
import { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
// @ts-ignore
import { toast } from 'react-hot-toast';
import { reviewApi } from '@/api/review.api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReviewModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ orderId, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewApi.submitReview({
        orderId,
        rating,
        comment: comment.trim()
      });
      toast.success('Cảm ơn bạn đã đánh giá!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h3 className="text-xl font-bold">Đánh giá giao dịch</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Chia sẻ cảm nhận của bạn về xe và người bán</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Star Rating Section */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Điểm đánh giá</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90 hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-10 w-10 transition-colors",
                      (hoverRating || rating) >= star 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-muted stroke-[1.5px]"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="text-lg font-bold text-amber-600">
              {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : 'Rất tệ'}
            </span>
          </div>

          {/* Comment Section */}
          <div className="space-y-4">
            <label className="text-sm font-semibold block uppercase tracking-widest text-muted-foreground">Lời nhắn</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập cảm nhận của bạn về sản phẩm, thái độ phục vụ của người bán..."
              className="w-full h-32 bg-muted/50 border-2 border-border focus:border-primary focus:bg-background rounded-2xl p-4 transition-all outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border flex gap-4">
          <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : (
              <>
                <Send className="h-4 w-4" />
                Gửi đánh giá
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
