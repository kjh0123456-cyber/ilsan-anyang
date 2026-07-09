jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("../lib/supabase/admin", () => ({
  createAdminClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../lib/email", () => ({
  sendOrderConfirmationEmail: jest.fn(),
  sendAdminOrderNotificationEmail: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
  getAllOrdersForAdmin,
  updateOrderStatus,
} from "@/lib/actions/orders";

function mockOrdersSelect(result: { data: unknown; error: unknown }) {
  const order = jest.fn().mockResolvedValue(result);
  const select = jest.fn().mockReturnValue({ order });
  (createClient as jest.Mock).mockResolvedValue({
    from: jest.fn().mockReturnValue({ select }),
  });
}

function mockAdminListUsers(users: { id: string; email: string }[]) {
  const listUsers = jest
    .fn()
    .mockResolvedValueOnce({ data: { users }, error: null });
  (createAdminClient as jest.Mock).mockReturnValue({
    auth: { admin: { listUsers } },
  });
  return listUsers;
}

describe("getAllOrdersForAdmin", () => {
  beforeEach(() => jest.clearAllMocks());

  it("모든 주문을 유저 필터 없이 조회하고 구매자 이메일을 붙인다", async () => {
    mockOrdersSelect({
      data: [
        { id: "o1", user_id: "u1", total_amount: 1000, status: "paid" },
        { id: "o2", user_id: "u2", total_amount: 2000, status: "shipping" },
      ],
      error: null,
    });
    mockAdminListUsers([
      { id: "u1", email: "buyer1@test.com" },
      { id: "u2", email: "buyer2@test.com" },
    ]);

    const orders = await getAllOrdersForAdmin();

    expect(orders).toHaveLength(2);
    expect(orders[0].buyer_email).toBe("buyer1@test.com");
    expect(orders[1].buyer_email).toBe("buyer2@test.com");
  });

  it("주문이 없으면 빈 배열을 반환하고 유저 목록을 조회하지 않는다", async () => {
    mockOrdersSelect({ data: [], error: null });
    const listUsers = jest.fn();
    (createAdminClient as jest.Mock).mockReturnValue({
      auth: { admin: { listUsers } },
    });

    const orders = await getAllOrdersForAdmin();

    expect(orders).toEqual([]);
    expect(listUsers).not.toHaveBeenCalled();
  });
});

describe("updateOrderStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("올바르지 않은 상태값이면 에러를 던진다", async () => {
    await expect(updateOrderStatus("o1", "invalid")).rejects.toThrow(
      "올바르지 않은 주문 상태입니다."
    );
  });

  it("유효한 상태면 업데이트하고 관련 경로를 재검증한다", async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq });
    (createClient as jest.Mock).mockResolvedValue({
      from: jest.fn().mockReturnValue({ update }),
    });

    await updateOrderStatus("o1", "shipping");

    expect(update).toHaveBeenCalledWith({ status: "shipping" });
    expect(eq).toHaveBeenCalledWith("id", "o1");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/orders");
  });
});
