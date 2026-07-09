import { Resend } from "resend";
import type { CartItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export interface OrderEmailData {
  orderId: string;
  items: CartItem[];
  totalAmount: number;
}

function buildItemsHtml(items: CartItem[]): string {
  return items
    .map(
      (item) =>
        `<li>${item.product.name} x ${item.quantity} - ${formatPrice(
          item.product.price * item.quantity
        )}</li>`
    )
    .join("");
}

export function buildOrderConfirmationEmail(data: OrderEmailData) {
  return {
    subject: `[주문 확인] 주문번호 ${data.orderId}`,
    html: `
      <h1>주문이 완료되었습니다</h1>
      <p>주문번호: ${data.orderId}</p>
      <ul>${buildItemsHtml(data.items)}</ul>
      <p>총 결제금액: ${formatPrice(data.totalAmount)}</p>
    `,
  };
}

export function buildAdminOrderNotificationEmail(
  buyerEmail: string,
  data: OrderEmailData
) {
  return {
    subject: `[신규 주문] 주문번호 ${data.orderId}`,
    html: `
      <h1>신규 주문이 접수되었습니다</h1>
      <p>구매자: ${buyerEmail}</p>
      <p>주문번호: ${data.orderId}</p>
      <ul>${buildItemsHtml(data.items)}</ul>
      <p>총 결제금액: ${formatPrice(data.totalAmount)}</p>
    `,
  };
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderEmailData
): Promise<void> {
  const { subject, html } = buildOrderConfirmationEmail(data);
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
}

export async function sendAdminOrderNotificationEmail(
  buyerEmail: string,
  data: OrderEmailData
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL 환경변수가 설정되지 않았습니다.");
  }

  const { subject, html } = buildAdminOrderNotificationEmail(buyerEmail, data);
  await resend.emails.send({ from: FROM_EMAIL, to: adminEmail, subject, html });
}
