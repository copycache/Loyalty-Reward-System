"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Package, Loader2 } from "lucide-react";

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

interface PackageOption {
  id: number;
  name: string;
  price: string | number;
  description?: string;
  [key: string]: unknown;
}

export default function WizardStep5() {
  const router = useRouter();
  const saved = getStored();

  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>(saved.package_id || "");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { apiPost } = await import("@/lib/api");
        const res = await apiPost<any>("/api/member/packages", {});
        const list = Array.isArray(res) ? res : res?.data ?? res?.packages ?? [];
        setPackages(list);
      } catch {
        // Use fallback packages
        setPackages([
          { id: 1, name: "Silver", price: 1000, description: "Basic membership" },
          { id: 2, name: "Gold", price: 2500, description: "Premium membership" },
          { id: 3, name: "Platinum", price: 5000, description: "Elite membership" },
        ]);
      }
      setLoading(false);
    };
    fetchPackages();
  }, []);

  const handleNext = () => {
    if (!selected) {
      toast.error("Please select a membership package");
      return;
    }
    store({ ...getStored(), package_id: selected });
    router.push("/wizard/6");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600" />
          Membership Package
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : packages.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No packages available
            </p>
          ) : (
            <RadioGroup value={selected} onValueChange={setSelected}>
              <div className="grid gap-3">
                {packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selected === String(pkg.id)
                        ? "border-green-500 bg-green-50"
                        : "hover:border-green-200"
                    }`}
                  >
                    <RadioGroupItem value={String(pkg.id)} id={`pkg-${pkg.id}`} />
                    <div className="flex-1">
                      <Label
                        htmlFor={`pkg-${pkg.id}`}
                        className="font-semibold text-base cursor-pointer"
                      >
                        {pkg.name}
                      </Label>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      ₱{pkg.price}
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.push("/wizard/4")}>
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700"
              disabled={!selected}
            >
              Next Step
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
