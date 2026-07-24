"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiPost, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function MemberRegisterReferralPage() {
  const router = useRouter();
  const params = useParams();
  const slotNo = params?.slot_no as string;
  const [loading, setLoading] = useState(true);
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    username: "",
    email: "",
    contact: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (!slotNo) return;
    apiPost("/api/member/get_slot_info", { slot_no: slotNo })
      .then((res) => {
        setReferralInfo(res.data || res);
      })
      .catch(() => toast.error("Failed to load referral info."))
      .finally(() => setLoading(false));
  }, [slotNo]);

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
    setSubmitting(true);
    try {
      await apiPost("/api/new_register", { ...form, slot_referral: slotNo });
      toast.success("Registration successful! Please check your email for verification.");
      router.push("/member/login");
    } catch (err: any) {
      if (err instanceof ApiError && err.errors) {
        Object.values(err.errors).forEach((msgs: string[]) => {
          msgs.forEach((m: string) => toast.error(m));
        });
      } else {
        toast.error(err?.message || "Registration failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-2">
            <img
              src="/images/logo/logo.png"
              alt="Travel Connect"
              className="h-16 mx-auto"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </Link>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Referred by: <span className="font-semibold text-green-600">{referralInfo?.name || slotNo}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" placeholder="First name" value={form.first_name} onChange={(e) => updateField("first_name", e.target.value)} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" placeholder="Last name" value={form.last_name} onChange={(e) => updateField("last_name", e.target.value)} disabled={submitting} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={form.email} onChange={(e) => updateField("email", e.target.value)} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input id="middle_name" placeholder="Middle name" value={form.middle_name} onChange={(e) => updateField("middle_name", e.target.value)} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input id="username" placeholder="Choose a username" maxLength={15} value={form.username} onChange={(e) => updateField("username", e.target.value)} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input id="contact" placeholder="e.g. 09171234567" value={form.contact} onChange={(e) => updateField("contact", e.target.value)} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" placeholder="Enter password" value={form.password} onChange={(e) => updateField("password", e.target.value)} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password *</Label>
              <Input id="password_confirmation" type="password" placeholder="Re-enter password" value={form.password_confirmation} onChange={(e) => updateField("password_confirmation", e.target.value)} disabled={submitting} />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {submitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/member/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
