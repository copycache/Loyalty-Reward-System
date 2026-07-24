"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff } from "lucide-react";

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

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  return Math.min(score, 100);
}

function getStrengthLabel(score: number): { label: string; color: string } {
  if (score < 25) return { label: "Weak", color: "bg-red-500" };
  if (score < 50) return { label: "Fair", color: "bg-orange-500" };
  if (score < 75) return { label: "Good", color: "bg-yellow-500" };
  return { label: "Strong", color: "bg-green-500" };
}

export default function WizardStep3() {
  const router = useRouter();
  const saved = getStored();

  const [form, setForm] = useState({
    username: saved.username || "",
    password: saved.password || "",
    confirm_password: saved.confirm_password || "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);
  const strengthInfo = getStrengthLabel(passwordStrength);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!form.username || !form.password) {
      toast.error("Username and password are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    store({ ...getStored(), ...form });
    router.push("/wizard/4");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-green-600" />
          Account Credentials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Username *</Label>
            <Input
              placeholder="Choose a username"
              maxLength={15}
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.password && (
              <div className="space-y-1 mt-1">
                <Progress value={passwordStrength} className={strengthInfo.color} />
                <p className="text-xs text-muted-foreground">
                  Strength: <span className="font-medium">{strengthInfo.label}</span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Confirm Password *</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirm_password}
                onChange={(e) => updateField("confirm_password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.confirm_password && form.password !== form.confirm_password && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.push("/wizard/2")}>
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
