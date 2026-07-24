"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function EmailActivatedPage() {
  const router = useRouter();
  const params = useParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const code = params?.code;
    const id = params?.id;
    if (!code || !id) {
      setStatus("error");
      setMessage("Invalid activation link.");
      return;
    }
    const activate = async () => {
      try {
        const res = await apiPost("/api/email_activation", { code, id });
        if (res.status === "success" || res.status_code === 200) {
          setStatus("success");
          setMessage(res.status_message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(res.status_message || "Activation failed.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Activation failed.");
      }
    };
    activate();
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === "loading" ? (
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            ) : status === "success" ? (
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" ? "Verifying..." : status === "success" ? "Email Verified!" : "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {status !== "loading" && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/member/login")}
            >
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
