jest.mock("../lib/supabase/admin", () => ({
  createAdminClient: jest.fn(),
}));
jest.mock("../lib/email", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetEmail } from "@/lib/email";
import { requestPasswordReset } from "@/lib/actions/auth";

function mockAdmin(result: {
  data?: { properties: { action_link: string } };
  error: unknown;
}) {
  const generateLink = jest.fn().mockResolvedValue(result);
  (createAdminClient as jest.Mock).mockReturnValue({
    auth: { admin: { generateLink } },
  });
  return generateLink;
}

function buildFormData(email: string) {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

describe("requestPasswordReset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("이메일이 비어있으면 에러를 반환한다", async () => {
    const result = await requestPasswordReset(buildFormData(""));
    expect(result).toEqual({ error: "이메일을 입력해주세요." });
  });

  it("이메일이 유효하면 재설정 링크를 발송하고 성공을 반환한다", async () => {
    const generateLink = mockAdmin({
      data: { properties: { action_link: "https://example.com/verify?token=abc" } },
      error: null,
    });

    const result = await requestPasswordReset(
      buildFormData("kjh0123456@gmail.com")
    );

    expect(generateLink).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "recovery",
        email: "kjh0123456@gmail.com",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("/auth/reset-password"),
        }),
      })
    );
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      "kjh0123456@gmail.com",
      "https://example.com/verify?token=abc"
    );
    expect(result).toEqual({ success: true });
  });

  it("존재하지 않는 이메일이면 발송 없이 성공을 반환한다 (이메일 존재 여부 비노출)", async () => {
    mockAdmin({ error: { code: "user_not_found", message: "not found" } });

    const result = await requestPasswordReset(
      buildFormData("nobody@test.com")
    );

    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("링크 생성이 실패하면 에러를 반환한다", async () => {
    mockAdmin({ error: { code: "unexpected_failure", message: "fail" } });

    const result = await requestPasswordReset(
      buildFormData("kjh0123456@gmail.com")
    );

    expect(result).toEqual({ error: "재설정 링크 발송에 실패했습니다." });
  });

  it("이메일 발송이 실패하면 에러를 반환한다", async () => {
    mockAdmin({
      data: { properties: { action_link: "https://example.com/verify?token=abc" } },
      error: null,
    });
    (sendPasswordResetEmail as jest.Mock).mockRejectedValue(new Error("send failed"));

    const result = await requestPasswordReset(
      buildFormData("kjh0123456@gmail.com")
    );

    expect(result).toEqual({ error: "재설정 링크 발송에 실패했습니다." });
  });
});
