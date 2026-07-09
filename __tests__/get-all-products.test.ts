jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("../lib/supabase/admin", () => ({
  createAdminClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/actions/products";

// order() must return something that is both awaitable (thenable, for the
// includeDeleted=true path which awaits it directly) and chainable via
// .is() (for the default path, which calls .is() before awaiting).
function mockSupabase(result: { data: unknown; error: unknown }) {
  const is = jest.fn().mockResolvedValue(result);
  const orderResult = {
    is,
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  const order = jest.fn().mockReturnValue(orderResult);
  const select = jest.fn().mockReturnValue({ order });
  (createClient as jest.Mock).mockResolvedValue({
    from: jest.fn().mockReturnValue({ select }),
  });
  return { select, order, is };
}

describe("getAllProducts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("기본적으로 삭제되지 않은 상품만 조회한다(deleted_at is null 필터)", async () => {
    const { is } = mockSupabase({ data: [], error: null });

    await getAllProducts();

    expect(is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("includeDeleted가 true면 삭제 필터 없이 전체를 조회한다", async () => {
    const { is, order } = mockSupabase({ data: [], error: null });

    await getAllProducts(true);

    expect(is).not.toHaveBeenCalled();
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("에러가 나면 던진다", async () => {
    mockSupabase({ data: null, error: { message: "db error" } });
    await expect(getAllProducts()).rejects.toEqual({ message: "db error" });
  });
});
