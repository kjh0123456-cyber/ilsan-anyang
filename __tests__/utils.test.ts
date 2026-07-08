import { formatPrice, formatDate, validateNewPassword } from "@/lib/utils";

describe("formatPrice", () => {
  it("1000원을 '1,000원'으로 포맷한다", () => {
    expect(formatPrice(1000)).toBe("1,000원");
  });

  it("1000000원을 '1,000,000원'으로 포맷한다", () => {
    expect(formatPrice(1000000)).toBe("1,000,000원");
  });

  it("0원을 '0원'으로 포맷한다", () => {
    expect(formatPrice(0)).toBe("0원");
  });
});

describe("formatDate", () => {
  it("날짜를 'YYYY.MM.DD' 형식으로 포맷한다", () => {
    const result = formatDate("2026-07-06T00:00:00Z");
    expect(result).toMatch(/2026\.07\.0[56]/); // timezone-safe
  });
});

describe("validateNewPassword", () => {
  it("8자 미만이면 에러 메시지를 반환한다", () => {
    expect(validateNewPassword("short1", "short1")).toBe(
      "비밀번호는 8자 이상이어야 합니다."
    );
  });

  it("두 비밀번호가 일치하지 않으면 에러 메시지를 반환한다", () => {
    expect(validateNewPassword("password1", "password2")).toBe(
      "비밀번호가 일치하지 않습니다."
    );
  });

  it("8자 이상이고 서로 일치하면 null을 반환한다", () => {
    expect(validateNewPassword("password1", "password1")).toBeNull();
  });
});
