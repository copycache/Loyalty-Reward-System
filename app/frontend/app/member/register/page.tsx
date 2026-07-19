"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    username: "",
    email: "",
    contact: "",
    password: "",
    password_confirmation: "",
    slot_referral: searchParams.get("ref") || (typeof window !== "undefined" ? localStorage.getItem("slot_referral") || "" : ""),
  });

  useEffect(() => {
    apiPost("/api/get_country", {}).then((res) => {
      if (Array.isArray(res)) setCountries(res);
      else if (res?.data) setCountries(res.data);
    }).catch(console.error);
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await apiPost("/api/new_register", form);
      toast.success("Registration successful! Please check your email for verification.");
      router.push("/member/login");
    } catch (err: any) {
      // Handle Laravel 422 validation errors with per-field messages
      if (err instanceof ApiError && err.errors) {
        Object.values(err.errors).forEach((msgs: string[]) => {
          msgs.forEach((m: string) => toast.error(m));
        });
      } else {
        toast.error(err?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-2">
            <img
              src="/images/logo/logo.png"
              alt="Travel Connect"
              className="h-16 mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </Link>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Register to become a Domus Naturae member</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="First name"
                  value={form.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                placeholder="Middle name"
                value={form.middle_name}
                onChange={(e) => updateField("middle_name", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Choose a username"
                maxLength={15}
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                placeholder="e.g. 09171234567"
                value={form.contact}
                onChange={(e) => updateField("contact", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password *</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Re-enter password"
                value={form.password_confirmation}
                onChange={(e) => updateField("password_confirmation", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsor">Sponsor Username (optional)</Label>
              <Input
                id="sponsor"
                placeholder="e.g. john123"
                value={form.slot_referral}
                onChange={(e) => updateField("slot_referral", e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/member/login" className="text-green-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MemberRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
