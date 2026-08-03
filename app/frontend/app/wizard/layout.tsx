"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const steps = [
  { num: 1, label: "Personal Info" },
  { num: 2, label: "Address" },
  { num: 3, label: "Credentials" },
  { num: 4, label: "Sponsor" },
  { num: 5, label: "Package" },
  { num: 6, label: "Review" },
];

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = parseInt(pathname.split("/").pop() || "1", 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src="/member_img/client-resources/logo/logo.png"
              alt="Logo"
              className="h-14 mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </Link>
          <h1 className="text-2xl font-bold mt-4 text-green-800">Registration</h1>
          <p className="text-muted-foreground text-sm">
            Step {currentStep} of 6
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step.num === currentStep
                        ? "bg-green-600 text-white"
                        : step.num < currentStep
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.num < currentStep ? "✓" : step.num}
                  </div>
                  <span
                    className={`text-xs mt-1 hidden sm:block ${
                      step.num === currentStep
                        ? "text-green-700 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.num < currentStep ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
