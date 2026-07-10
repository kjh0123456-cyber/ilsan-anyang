import {
  formatPrice,
  formatDate,
  validateNewPassword,
  validateShippingInfo,
  toKstDateString,
  toKstYearMonth,
} from "@/lib/utils";
import type { ShippingInfo } from "@/lib/types";

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

describe("validateShippingInfo", () => {
  const valid: ShippingInfo = {
    recipientName: "홍길동",
    phone: "010-1234-5678",
    zipCode: "12345",
    address: "경기도 고양시 일산동구 중앙로 123",
    addressDetail: "101동 202호",
    deliveryRequest: "",
  };

  it("모든 필수 항목이 채워져 있으면 null을 반환한다", () => {
    expect(validateShippingInfo(valid)).toBeNull();
  });

  it("배송 요청사항은 선택 입력이라 비어 있어도 통과한다", () => {
    expect(validateShippingInfo({ ...valid, deliveryRequest: "" })).toBeNull();
  });

  it("수령인 이름이 비어있으면 에러 메시지를 반환한다", () => {
    expect(validateShippingInfo({ ...valid, recipientName: "  " })).toBe(
      "수령인 이름을 입력해주세요."
    );
  });

  it("연락처가 비어있으면 에러 메시지를 반환한다", () => {
    expect(validateShippingInfo({ ...valid, phone: "" })).toBe(
      "연락처를 입력해주세요."
    );
  });

  it("연락처 형식이 올바르지 않으면 에러 메시지를 반환한다", () => {
    expect(validateShippingInfo({ ...valid, phone: "전화주세요" })).toBe(
      "올바른 연락처 형식이 아닙니다."
    );
  });

  it("우편번호나 주소가 비어있으면 에러 메시지를 반환한다", () => {
    expect(validateShippingInfo({ ...valid, zipCode: "" })).toBe(
      "우편번호 검색으로 배송지 주소를 입력해주세요."
    );
    expect(validateShippingInfo({ ...valid, address: "" })).toBe(
      "우편번호 검색으로 배송지 주소를 입력해주세요."
    );
  });

  it("상세 주소가 비어있으면 에러 메시지를 반환한다", () => {
    expect(validateShippingInfo({ ...valid, addressDetail: "" })).toBe(
      "상세 주소를 입력해주세요."
    );
  });
});
