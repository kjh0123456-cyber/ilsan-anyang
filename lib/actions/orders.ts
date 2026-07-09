"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderStatus, CartItem } from "@/lib/types";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
} from "@/lib/email";
import { revalidatePath } from "next/cache";

const ORDER_STATUSES: OrderStatus[] = [
  "paid",
  "shipping",
  "delivered",
  "cancelled",
];

async function verifyTossPayment(
  paymentKey: string,
  tossOrderId: string,
  amount: number
) {
  const secretKey = process.env.TOSS_SECRET_KEY!;
  const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId: tossOrderId, amount }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "결제 승인에 실패했습니다.");
  }
}

/**
 * 결제 위젯이 successUrl로 리다이렉트해온 뒤에만 호출된다. 토스 서버에
 * 결제 승인을 먼저 확인하고, 그게 성공했을 때만 주문을 생성한다 —
 * 결제를 실패/취소하면 주문 행 자체가 생기지 않는다.
 */
export async function createOrder(
  items: CartItem[],
  totalAmount: number,
  payment: { tossOrderId: string; paymentKey: string }
): Promise<string> {
  await verifyTossPayment(payment.paymentKey, payment.tossOrderId, totalAmount);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      status: "paid",
      toss_payment_key: payment.paymentKey,
    })
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

  if (user.email) {
    const emailData = { orderId: order.id, items, totalAmount };
    try {
      await sendOrderConfirmationEmail(user.email, emailData);
    } catch (error) {
      console.error("주문 확인 이메일 발송 실패:", error);
    }
    try {
      await sendAdminOrderNotificationEmail(user.email, emailData);
    } catch (error) {
      console.error("관리자 주문 알림 이메일 발송 실패:", error);
    }
  }

  return order.id;
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

export async function getAllOrdersForAdmin(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const orders = data as Order[];

  if (orders.length === 0) return orders;

  const admin = createAdminClient();
  const emailByUserId = new Map<string, string>();
  let page = 1;
  const perPage = 200;
  while (true) {
    const {
      data: { users },
      error: usersError,
    } = await admin.auth.admin.listUsers({ page, perPage });
    if (usersError) break;
    for (const u of users) {
      if (u.email) emailByUserId.set(u.id, u.email);
    }
    if (users.length < perPage) break;
    page += 1;
  }

  return orders.map((order) => ({
    ...order,
    buyer_email: emailByUserId.get(order.user_id),
  }));
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new Error("올바르지 않은 주문 상태입니다.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error("상태 업데이트 실패");

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/orders");
}
