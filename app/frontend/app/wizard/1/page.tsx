"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User } from "lucide-react";

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

export default function WizardStep1() {
  const router = useRouter();
  const saved = getStored();

  const [form, setForm] = useState({
    first_name: saved.first_name || "",
    last_name: saved.last_name || "",
    email: saved.email || "",
    contact_number: saved.contact_number || "",
    birthday: saved.birthday || "",
    gender: saved.gender || "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!form.first_name || !form.last_name || !form.email) {
      toast.error("First name, last name, and email are required");
      return;
    }
    store({ ...getStored(), ...form });
    router.push("/wizard/2");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-green-600" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                placeholder="First name"
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Number</Label>
            <Input
              placeholder="+63 912 345 6789"
              value={form.contact_number}
              onChange={(e) => updateField("contact_number", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Birthday</Label>
              <Input
                type="date"
                value={form.birthday}
                onChange={(e) => updateField("birthday", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => updateField("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
              Next Step
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
