"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createReview } from "@/lib/actions/reviews";

export default function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  async function handleSubmit(formData: FormData) {
    formData.set("rating", rating.toString());
    const result = await createReview(formData);
    if (result?.error) alert(result.error);
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-3 border rounded-lg p-6 bg-gray-50"
    >
      <input type="hidden" name="product_id" value={productId} />
      <p className="font-medium text-sm">리뷰 작성</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                i < (hover || rating)
                  ? "fill-gold text-gold"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        name="content"
        rows={3}
        placeholder="제품 사용 후기를 남겨주세요"
        className="w-full border rounded-lg p-2 text-sm resize-none"
        required
      />
      <Button type="submit" size="sm" className="bg-navy hover:bg-navy-light text-white">
        등록
      </Button>
    </form>
  );
}
