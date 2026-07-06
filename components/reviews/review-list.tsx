import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/lib/types";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">아직 리뷰가 없습니다.</p>
    );
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.round(avgRating)
                  ? "fill-gold text-gold"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          ({reviews.length}개)
        </span>
      </div>
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? "fill-gold text-gold"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(review.created_at)}
            </span>
          </div>
          <p className="text-sm">{review.content}</p>
        </div>
      ))}
    </div>
  );
}
