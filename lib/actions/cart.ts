"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartItem, Product } from "@/lib/types";
import { revalidatePath } from "next/cache";

interface CartRow {
  quantity: number;
  product: Product | null;
}

export async function getCartItems(): Promise<CartItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity, product:products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data as unknown as CartRow[])
    .filter((row): row is CartRow & { product: Product } => row.product !== null)
    .map((row) => ({ product: row.product, quantity: row.quantity }));
}

async function upsertQuantity(
  userId: string,
  productId: string,
  quantity: number
) {
  const supabase = await createClient();
  const { error } = await supabase.from("cart_items").upsert(
    {
      user_id: userId,
      product_id: productId,
      quantity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" }
  );
  if (error) throw error;
}

export async function addToCartDB(
  productId: string,
  quantity: number = 1
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();
  if (productError || !product) throw new Error("상품을 찾을 수 없습니다.");

  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const nextQuantity = Math.min(
    (existing?.quantity ?? 0) + quantity,
    product.stock
  );
  if (nextQuantity < 1) return;

  await upsertQuantity(user.id, productId, nextQuantity);
  revalidatePath("/cart");
}

export async function updateCartItemQuantityDB(
  productId: string,
  quantity: number
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  if (quantity < 1) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) throw error;
    revalidatePath("/cart");
    return;
  }

  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();
  const capped = product ? Math.min(quantity, product.stock) : quantity;

  await upsertQuantity(user.id, productId, capped);
  revalidatePath("/cart");
}

export async function removeFromCartDB(productId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);
  if (error) throw error;
  revalidatePath("/cart");
}

export async function clearCartDB(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/cart");
}

/**
 * 비로그인 상태에서 담아둔 로컬 장바구니를 로그인 계정의 DB 장바구니에
 * 병합한다. 이미 계정 장바구니에 있는 상품은 수량을 더하고(재고 한도까지),
 * 없던 상품은 새로 추가한다.
 */
export async function mergeGuestCartIntoAccount(
  guestItems: { productId: string; quantity: number }[]
): Promise<void> {
  if (guestItems.length === 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const productIds = guestItems.map((i) => i.productId);
  const { data: products } = await supabase
    .from("products")
    .select("id, stock")
    .in("id", productIds);
  const stockById = new Map((products ?? []).map((p) => [p.id, p.stock]));

  const { data: existingRows } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", user.id)
    .in("product_id", productIds);
  const existingById = new Map(
    (existingRows ?? []).map((r) => [r.product_id, r.quantity])
  );

  for (const item of guestItems) {
    const stock = stockById.get(item.productId);
    if (stock === undefined) continue; // product no longer exists
    const merged = Math.min(
      (existingById.get(item.productId) ?? 0) + item.quantity,
      stock
    );
    if (merged < 1) continue;
    await upsertQuantity(user.id, item.productId, merged);
  }

  revalidatePath("/cart");
}
