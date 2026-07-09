import type { CartItem } from "@/lib/types";

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ data: { id: "email_123" }, error: null }),
    },
  })),
}));

import { Resend } from "resend";
import {
  buildOrderConfirmationEmail,
  buildAdminOrderNotificationEmail,
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
} from "@/lib/email";

function getMockSend() {
  const ResendMock = Resend as unknown as jest.Mock;
  return ResendMock.mock.results[0].value.emails.send as jest.Mock;
}

const mockItems: CartItem[] = [
  {
    product: {
      id: "p1",
      name: "무선 청소기",
      description: "",
      price: 100000,
      stock: 10,
      category: "vacuum",
      images: [],
      specs: {},
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      deleted_at: null,
    },
    quantity: 2,
  },
];

const orderData = {
  orderId: "order-1",
  items: mockItems,
  totalAmount: 200000,
};

describe("buildOrderConfirmationEmail", () => {
  it("주문번호, 상품명, 수량, 총 결제금액을 포함한다", () => {
    const { subject, html } = buildOrderConfirmationEmail(orderData);
    expect(subject).toContain("order-1");
    expect(html).toContain("무선 청소기");
    expect(html).toContain("2");
    expect(html).toContain("200,000원");
  });
});

describe("buildAdminOrderNotificationEmail", () => {
  it("구매자 이메일과 주문 내역을 포함한다", () => {
    const { subject, html } = buildAdminOrderNotificationEmail(
      "buyer@test.com",
      orderData
    );
    expect(subject).toContain("order-1");
    expect(html).toContain("buyer@test.com");
    expect(html).toContain("무선 청소기");
    expect(html).toContain("200,000원");
  });
});

describe("sendOrderConfirmationEmail", () => {
  beforeEach(() => getMockSend().mockClear());

  it("구매자 이메일 주소로 발송한다", async () => {
    await sendOrderConfirmationEmail("buyer@test.com", orderData);
    expect(getMockSend()).toHaveBeenCalledWith(
      expect.objectContaining({ to: "buyer@test.com" })
    );
  });
});

describe("sendAdminOrderNotificationEmail", () => {
  const originalEnv = process.env.ADMIN_EMAIL;

  beforeEach(() => getMockSend().mockClear());
  afterEach(() => {
    process.env.ADMIN_EMAIL = originalEnv;
  });

  it("ADMIN_EMAIL 환경변수 주소로 발송한다", async () => {
    process.env.ADMIN_EMAIL = "admin@test.com";
    await sendAdminOrderNotificationEmail("buyer@test.com", orderData);
    expect(getMockSend()).toHaveBeenCalledWith(
      expect.objectContaining({ to: "admin@test.com" })
    );
  });

  it("ADMIN_EMAIL이 없으면 에러를 던진다", async () => {
    delete process.env.ADMIN_EMAIL;
    await expect(
      sendAdminOrderNotificationEmail("buyer@test.com", orderData)
    ).rejects.toThrow();
  });
});
