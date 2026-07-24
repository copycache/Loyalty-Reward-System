"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MemberEmailVerificationDashboardPage() {
  const { token } = useAuthStore();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await apiPost("/api/resend_verification", {}, token);
      if (res.status === "success" || res.status_code === 200) {
        toast.success(res.status_message || "Verification email sent!");
      } else {
        toast.error(res.status_message || "Failed to resend verification.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend verification.");
    }
    setResending(false);
  };

  return (
    <div className="flex items-center justify-center py-20">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>Verify your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Please check your email to verify your account. If you didn't receive the email, click the button below to resend.
          </p>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            {resending ? "Sending..." : "Resend Verification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
