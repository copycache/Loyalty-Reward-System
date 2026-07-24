import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TransactionPendingPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 text-center max-w-md">
        <div className="w-24 h-24 relative mx-auto mb-6">
          <Image
            src="/images/front/pending.png"
            alt="Pending"
            fill
            className="object-contain rounded-full"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4">Pending!</h1>
        <p className="text-muted-foreground mb-8">
          Your order has been received, but still awaiting for your payment. Please check and follow the instructions that was sent on your registered email to settle the payment. Thank you!
        </p>
        <Button asChild>
          <Link href="/member/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
