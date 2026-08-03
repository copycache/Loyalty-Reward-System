import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TransactionSuccessPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 text-center max-w-md">
        <div className="w-24 h-24 relative mx-auto mb-6">
          <Image
            src="/front/img/success.png"
            alt="Success"
            fill
            className="object-contain rounded-full"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4">Awesome!</h1>
        <p className="text-muted-foreground mb-8">
          We have received your payment. An automated receipt will be sent to your registered email.
        </p>
        <Button asChild>
          <Link href="/member/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
