import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function TransactionPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-amber-100">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-14 w-14 text-yellow-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-yellow-700">Pending!</h1>
            <p className="text-muted-foreground">
              Your order has been received, but still awaiting for your payment. Please check and follow the instructions that was sent on your registered email to settle the payment. Thank you!
            </p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/member/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
