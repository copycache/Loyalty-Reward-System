"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProductLinkRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const slotReferral = params?.slot_referral as string;

  useEffect(() => {
    if (slotReferral) {
      localStorage.setItem("slot_referral", slotReferral);
      localStorage.setItem("product_referral", slotReferral);
    }
    router.replace("/member/shopping");
  }, [slotReferral, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
