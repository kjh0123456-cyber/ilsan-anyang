"use server";

import { createClient } from "@/lib/supabase/server";
import type { Order, CartItem } from "@/lib/types";

export async function createOrder(
  items: CartItem[],
  totalAmount: number
): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, total_amount: totalAmount, status: "paid" })
    .select()
    .single();

  if (orderError || !order) throw new Error("주문 생성 실패");

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);
  if (itemsError) throw new Error("주문 상품 저장 실패");

  return order.id;
}

export async function confirmPayment(orderId: string, paymentKey: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ toss_payment_key: paymentKey, status: "paid" })
    .eq("id", orderId);

  if (error) throw new Error("결제 확인 실패");
}

export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Order[];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error("상태 업데이트 실패");
}
