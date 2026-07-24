"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";

const WIZARD_KEY = "wizard_data";

function getStored(): Record<string, any> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(WIZARD_KEY) || "{}");
  } catch {
    return {};
  }
}

function clearWizard() {
  localStorage.removeItem(WIZARD_KEY);
}

export default function WizardStep6() {
  const router = useRouter();
  const data = getStored();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fields: { label: string; key: string }[] = [
    { label: "First Name", key: "first_name" },
    { label: "Last Name", key: "last_name" },
    { label: "Email", key: "email" },
    { label: "Contact Number", key: "contact_number" },
    { label: "Birthday", key: "birthday" },
    { label: "Gender", key: "gender" },
    { label: "Address", key: "address" },
    { label: "City", key: "city" },
    { label: "State / Province", key: "state" },
    { label: "Country", key: "country" },
    { label: "ZIP Code", key: "zip_code" },
    { label: "Username", key: "username" },
    { label: "Sponsor Code", key: "sponsor_code" },
    { label: "Placement", key: "placement" },
    { label: "Package ID", key: "package_id" },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { apiPost } = await import("@/lib/api");
      await apiPost("/api/new_register", {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        contact_number: data.contact_number,
        birthday: data.birthday,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zip_code: data.zip_code,
        username: data.username,
        password: data.password,
        password_confirmation: data.confirm_password,
        slot_referral: data.sponsor_code,
        placement: data.placement,
        package_id: data.package_id,
      });
      clearWizard();
      setSubmitted(true);
      toast.success("Registration successful!");
    } catch (err: any) {
      const { ApiError } = await import("@/lib/api");
      if (err instanceof ApiError && err.errors) {
        Object.values(err.errors).forEach((msgs: string[]) => {
          msgs.forEach((m: string) => toast.error(m));
        });
      } else {
        toast.error(err?.message || "Registration failed");
      }
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Registration Successful!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your account has been created. Please check your email for verification.
          </p>
          <Link href="/member/login">
            <Button className="bg-green-600 hover:bg-green-700">
              Proceed to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    { title: "Personal Information", keys: ["first_name", "last_name", "email", "contact_number", "birthday", "gender"] },
    { title: "Address", keys: ["address", "city", "state", "country", "zip_code"] },
    { title: "Account", keys: ["username"] },
    { title: "Sponsor", keys: ["sponsor_code", "placement"] },
    { title: "Package", keys: ["package_id"] },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Review & Submit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sections.map((section) => {
            const values = section.keys
              .map((k) => ({ label: fields.find((f) => f.key === k)?.label || k, value: data[k] }))
              .filter((v) => v.value);
            if (values.length === 0) return null;
            return (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                  {section.title}
                </h3>
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
                  {values.map((v) => (
                    <div key={v.label}>
                      <Label className="text-xs text-muted-foreground">{v.label}</Label>
                      <p className="text-sm font-medium">{String(v.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.push("/wizard/5")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {submitting ? "Submitting..." : "Complete Registration"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
