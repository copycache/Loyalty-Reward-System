import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function TransactionFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-rose-100">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-14 w-14 text-red-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-red-700">Sorry, transaction could not be completed!</h1>
            <p className="text-muted-foreground">
              The payment for this transaction has failed. Please check your payment details.
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
