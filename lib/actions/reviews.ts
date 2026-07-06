"use server";

import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export async function createReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const productId = formData.get("product_id") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const content = formData.get("content") as string;

  if (!content.trim() || rating < 1 || rating > 5) {
    return { error: "올바른 리뷰 내용과 별점을 입력해주세요." };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    rating,
    content: content.trim(),
  });

  if (error) return { error: "이미 리뷰를 작성하셨습니다." };

  revalidatePath(`/products/${productId}`);
  return { success: true };
}
