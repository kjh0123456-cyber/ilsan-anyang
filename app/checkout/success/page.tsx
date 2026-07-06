import { confirmPayment } from "@/lib/actions/orders";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId: string;
    paymentKey: string;
    amount: string;
  }>;
}) {
  const params = await searchParams;
  await confirmPayment(params.orderId, params.paymentKey);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold text-navy">결제가 완료되었습니다</h1>
        <p className="text-muted-foreground">
          주문이 정상적으로 접수되었습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/orders">
            <Button variant="outline">주문 내역 보기</Button>
          </Link>
          <Link href="/">
            <Button className="bg-navy hover:bg-navy-light text-white">
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
