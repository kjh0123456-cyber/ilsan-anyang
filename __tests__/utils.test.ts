import { formatPrice, formatDate } from "@/lib/utils";

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
