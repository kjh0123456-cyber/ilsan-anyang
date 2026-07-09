jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("../lib/supabase/admin", () => ({
  createAdminClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProduct, deleteProduct } from "@/lib/actions/products";

function buildFormData(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    name: "루미봇 X2 로봇청소기",
    description: "강력한 흡입력",
    price: "890000",
    stock: "50",
    category: "vacuum",
    is_active: "on",
    existingImages: JSON.stringify(["https://example.com/kept.jpg"]),
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    formData.set(key, value);
  }
  return formData;
}

function mockSupabaseUpdate(result: { error: unknown }) {
  const eq = jest.fn().mockResolvedValue(result);
  const update = jest.fn().mockReturnValue({ eq });
  (createClient as jest.Mock).mockResolvedValue({
    from: jest.fn().mockReturnValue({ update }),
  });
  return { update, eq };
}

beforeEach(() => {
  jest.clearAllMocks();
  (createAdminClient as jest.Mock).mockReturnValue({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "" } }),
      }),
    },
  });
});

describe("updateProduct", () => {
  it("유효하지 않은 입력이면 에러를 반환한다", async () => {
    mockSupabaseUpdate({ error: null });
    const result = await updateProduct("p1", buildFormData({ price: "-1" }));
    expect(result).toEqual({ error: "가격을 올바르게 입력해주세요." });
  });

  it("기존 이미지를 유지하고 업데이트한 뒤 목록으로 리다이렉트한다", async () => {
    const { update } = mockSupabaseUpdate({ error: null });

    await updateProduct("p1", buildFormData());

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "루미봇 X2 로봇청소기",
        is_active: true,
        images: ["https://example.com/kept.jpg"],
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
    expect(redirect).toHaveBeenCalledWith("/admin/products");
  });

  it("is_active 체크가 해제되면 false로 저장한다", async () => {
    const { update } = mockSupabaseUpdate({ error: null });

    await updateProduct("p1", buildFormData({ is_active: "" }));

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: false })
    );
  });

  it("DB 업데이트가 실패하면 에러를 반환한다", async () => {
    mockSupabaseUpdate({ error: { message: "db error" } });
    const result = await updateProduct("p1", buildFormData());
    expect(result).toEqual({ error: "상품 수정에 실패했습니다." });
  });
});

describe("deleteProduct", () => {
  it("is_active를 false로 바꾸는 소프트 삭제를 수행한다", async () => {
    const { update, eq } = mockSupabaseUpdate({ error: null });

    const result = await deleteProduct("p1");

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith("id", "p1");
    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
  });

  it("실패하면 에러를 반환한다", async () => {
    mockSupabaseUpdate({ error: { message: "db error" } });
    const result = await deleteProduct("p1");
    expect(result).toEqual({ error: "상품 삭제에 실패했습니다." });
  });
});
