jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
jest.mock("../lib/actions/cart", () => ({
  mergeGuestCartIntoAccount: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { signup } from "@/lib/actions/auth";
import { mergeGuestCartIntoAccount } from "@/lib/actions/cart";

function mockSupabase(result: { data: { session: unknown }; error: unknown }) {
  const signUp = jest.fn().mockResolvedValue(result);
  (createClient as jest.Mock).mockResolvedValue({
    auth: { signUp },
  });
  return signUp;
}

function buildFormData(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    email: "buyer@test.com",
    password: "password1",
    redirect: "/checkout?buyNow=p1&qty=1",
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    formData.set(key, value);
  }
  return formData;
}

describe("signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("이메일이 비어있으면 에러를 반환한다", async () => {
    const result = await signup(buildFormData({ email: "" }));
    expect(result).toEqual({ error: "이메일과 비밀번호를 입력해주세요." });
  });

  it("이미 가입된 이메일이면 명확한 에러를 반환한다", async () => {
    mockSupabase({
      data: { session: null },
      error: { message: "exists", code: "user_already_exists" },
    });
    const result = await signup(buildFormData());
    expect(result).toEqual({ error: "이미 사용 중인 이메일입니다." });
  });

  it("이메일 발송 rate limit이면 실제 원인을 알려주는 에러를 반환한다 (이미 가입된 이메일이라고 오인하지 않는다)", async () => {
    mockSupabase({
      data: { session: null },
      error: { message: "email rate limit exceeded", code: "over_email_send_rate_limit" },
    });
    const result = await signup(buildFormData());
    expect(result).toEqual({
      error: "요청이 많아 이메일 발송이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
    });
  });

  it("그 외 실패는 일반 에러를 반환한다", async () => {
    mockSupabase({ data: { session: null }, error: { message: "unknown" } });
    const result = await signup(buildFormData());
    expect(result).toEqual({ error: "회원가입에 실패했습니다." });
  });

  it("이메일 인증이 꺼져 있어 세션이 즉시 생기면 redirect 대상으로 이동한다", async () => {
    const signUp = mockSupabase({
      data: { session: { access_token: "t" } },
      error: null,
    });

    await expect(signup(buildFormData())).rejects.toThrow(
      "REDIRECT:/checkout?buyNow=p1&qty=1"
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "buyer@test.com",
      password: "password1",
    });
  });

  it("이메일 인증이 켜져 있어 세션이 없으면 hasSession: false를 반환한다", async () => {
    mockSupabase({ data: { session: null }, error: null });

    const result = await signup(buildFormData());

    expect(result).toEqual({
      success: true,
      redirectTo: "/checkout?buyNow=p1&qty=1",
      hasSession: false,
    });
  });

  it("redirect 파라미터가 없으면 기본값 '/'로 이동한다", async () => {
    mockSupabase({ data: { session: { access_token: "t" } }, error: null });
    await expect(signup(buildFormData({ redirect: "" }))).rejects.toThrow(
      "REDIRECT:/"
    );
  });

  it("세션이 즉시 생기고 guestCart가 있으면 리다이렉트 전에 병합한다", async () => {
    mockSupabase({ data: { session: { access_token: "t" } }, error: null });
    const guestCart = [{ productId: "p1", quantity: 1 }];

    await expect(
      signup(buildFormData({ guestCart: JSON.stringify(guestCart) }))
    ).rejects.toThrow("REDIRECT:/checkout?buyNow=p1&qty=1");

    expect(mergeGuestCartIntoAccount).toHaveBeenCalledWith(guestCart);
  });

  it("세션이 없으면(이메일 인증 필요) guestCart가 있어도 병합하지 않는다", async () => {
    mockSupabase({ data: { session: null }, error: null });
    const guestCart = [{ productId: "p1", quantity: 1 }];

    await signup(buildFormData({ guestCart: JSON.stringify(guestCart) }));

    expect(mergeGuestCartIntoAccount).not.toHaveBeenCalled();
  });
});
