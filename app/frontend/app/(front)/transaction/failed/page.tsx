import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TransactionFailedPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 text-center max-w-md">
        <div className="w-24 h-24 relative mx-auto mb-6">
          <Image
            src="/images/front/failed.png"
            alt="Failed"
            fill
            className="object-contain rounded-full"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4">Sorry, transaction could not be completed!</h1>
        <p className="text-muted-foreground mb-8">
          The payment for this transaction has failed. Please check your payment details.
        </p>
        <Button asChild>
          <Link href="/member/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
