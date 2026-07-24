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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";

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

export default function WizardStep4() {
  const router = useRouter();
  const saved = getStored();

  const [form, setForm] = useState({
    sponsor_code: saved.sponsor_code || "",
    placement: saved.placement || "",
  });

  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "sponsor_code") setIsValid(null);
  };

  const validateSponsor = async () => {
    if (!form.sponsor_code.trim()) {
      toast.error("Please enter a sponsor code");
      return;
    }
    setValidating(true);
    setIsValid(null);
    try {
      const { apiPost } = await import("@/lib/api");
      const res = await apiPost("/api/validate_sponsor", {
        code: form.sponsor_code,
      });
      setIsValid(true);
      toast.success("Sponsor verified");
    } catch (err: any) {
      setIsValid(false);
      toast.error(err.message || "Invalid sponsor code");
    }
    setValidating(false);
  };

  const handleNext = () => {
    if (!form.sponsor_code.trim()) {
      toast.error("Please enter a sponsor code");
      return;
    }
    if (!form.placement) {
      toast.error("Please select a placement");
      return;
    }
    store({ ...getStored(), ...form });
    router.push("/wizard/5");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-green-600" />
          Sponsor Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sponsor Code / ID</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter sponsor code"
                value={form.sponsor_code}
                onChange={(e) => updateField("sponsor_code", e.target.value)}
              />
              <Button
                variant="outline"
                onClick={validateSponsor}
                disabled={validating || !form.sponsor_code.trim()}
              >
                {validating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
            {isValid === true && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                <CheckCircle className="h-3 w-3" />
                Valid sponsor
              </Badge>
            )}
            {isValid === false && (
              <Badge variant="destructive">Invalid sponsor code</Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label>Placement</Label>
            <Select
              value={form.placement}
              onValueChange={(v) => updateField("placement", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.push("/wizard/3")}>
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
