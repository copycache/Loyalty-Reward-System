"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function MemberNotifyPage() {
  const router = useRouter();
  const { token, logout } = useAuthStore();

  useEffect(() => {
    if (!token) router.replace("/member/login");
  }, [token, router]);

  const handleLogout = async () => {
    await logout();
    toast.success("You have been logged out.");
    router.push("/member/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-red-50 to-orange-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">Account Blocked</CardTitle>
          <CardDescription className="text-base">Account Information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your account has been blocked. Please contact the administrator for further assistance.
          </p>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
