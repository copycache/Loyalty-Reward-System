"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

const WIZARD_KEY = "wizard_data";

function getStored(): Record<string, any> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(WIZARD_KEY) || "{}");
  } catch {
    return {};
  }
}

function store(data: Record<string, any>) {
  localStorage.setItem(WIZARD_KEY, JSON.stringify(data));
}

export default function WizardStep2() {
  const router = useRouter();
  const saved = getStored();

  const [form, setForm] = useState({
    address: saved.address || "",
    city: saved.city || "",
    state: saved.state || "",
    country: saved.country || "",
    zip_code: saved.zip_code || "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!form.address || !form.city || !form.country) {
      toast.error("Address, city, and country are required");
      return;
    }
    store({ ...getStored(), ...form });
    router.push("/wizard/3");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Address Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input
              placeholder="Street address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City *</Label>
              <Input
                placeholder="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State / Province</Label>
              <Input
                placeholder="State or province"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country *</Label>
              <Input
                placeholder="Country"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                placeholder="ZIP code"
                value={form.zip_code}
                onChange={(e) => updateField("zip_code", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.push("/wizard/1")}>
              Back
            </Button>
            <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
              Next Step
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
