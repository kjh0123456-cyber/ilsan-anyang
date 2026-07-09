import {
  formatPrice,
  formatDate,
  validateNewPassword,
  toKstDateString,
  toKstYearMonth,
} from "@/lib/utils";

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

describe("toKstDateString", () => {
  it("UTC 자정 직후 시각을 KST(UTC+9) 날짜로 변환한다", () => {
    // 2026-07-06 15:30 UTC == 2026-07-07 00:30 KST
    expect(toKstDateString(new Date("2026-07-06T15:30:00Z"))).toBe(
      "2026-07-07"
    );
  });

  it("KST로도 같은 날이면 그대로 반환한다", () => {
    // 2026-07-06 01:00 UTC == 2026-07-06 10:00 KST
    expect(toKstDateString(new Date("2026-07-06T01:00:00Z"))).toBe(
      "2026-07-06"
    );
  });
});

describe("toKstYearMonth", () => {
  it("KST 기준 연-월을 반환한다", () => {
    // 2026-07-31 15:30 UTC == 2026-08-01 00:30 KST
    expect(toKstYearMonth(new Date("2026-07-31T15:30:00Z"))).toBe("2026-08");
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
