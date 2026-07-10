"use client";

import { useRef, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateShippingInfo } from "@/lib/utils";
import type { ShippingInfo } from "@/lib/types";

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: { zonecode: string; address: string }) => void;
      }) => { open: () => void };
    };
  }
}

const EMPTY: ShippingInfo = {
  recipientName: "",
  phone: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  deliveryRequest: "",
};

export default function ShippingForm({
  initial,
  onSubmit,
}: {
  initial?: ShippingInfo | null;
  onSubmit: (shipping: ShippingInfo) => void;
}) {
  const [shipping, setShipping] = useState<ShippingInfo>(() => initial ?? EMPTY);
  const addressDetailRef = useRef<HTMLInputElement>(null);

  // 이전 주문의 배송지 정보는 비동기로 불러와져 initial이 null에서 값으로
  // 한 번 바뀐다 — 그 순간을 렌더링 중에 감지해 폼에 반영한다.
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    if (initial) setShipping(initial);
  }

  function update(field: keyof ShippingInfo, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  function openPostcodeSearch() {
    if (!window.daum) {
      toast.error("우편번호 검색을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setShipping((prev) => ({
          ...prev,
          zipCode: data.zonecode,
          address: data.address,
        }));
        addressDetailRef.current?.focus();
      },
    }).open();
  }

  function handleNext() {
    const error = validateShippingInfo(shipping);
    if (error) {
      toast.error(error);
      return;
    }
    onSubmit(shipping);
  }

  return (
    <div className="space-y-5">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      <h2 className="text-lg font-bold text-navy">배송 정보</h2>

      <div className="space-y-2">
        <Label htmlFor="recipientName">수령인 이름 *</Label>
        <Input
          id="recipientName"
          value={shipping.recipientName}
          onChange={(e) => update("recipientName", e.target.value)}
          placeholder="홍길동"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">연락처 *</Label>
        <Input
          id="phone"
          value={shipping.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="010-1234-5678"
        />
      </div>

      <div className="space-y-2">
        <Label>배송지 주소 *</Label>
        <div className="flex gap-2">
          <Input
            value={shipping.zipCode}
            readOnly
            placeholder="우편번호"
            className="max-w-28 bg-gray-50"
          />
          <Button type="button" variant="outline" onClick={openPostcodeSearch}>
            우편번호 검색
          </Button>
        </div>
        <Input value={shipping.address} readOnly placeholder="기본 주소" className="bg-gray-50" />
        <Input
          ref={addressDetailRef}
          value={shipping.addressDetail}
          onChange={(e) => update("addressDetail", e.target.value)}
          placeholder="상세 주소 (동/호수 등)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryRequest">배송 요청사항 (선택)</Label>
        <textarea
          id="deliveryRequest"
          rows={2}
          value={shipping.deliveryRequest}
          onChange={(e) => update("deliveryRequest", e.target.value)}
          placeholder="예: 부재 시 문 앞에 놔주세요"
          className="w-full border rounded-lg p-2 text-sm resize-none"
        />
      </div>

      <Button
        type="button"
        onClick={handleNext}
        className="w-full bg-gold hover:bg-gold-light text-white h-12"
      >
        다음 단계로
      </Button>
    </div>
  );
}
