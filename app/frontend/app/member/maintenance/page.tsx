import { Wrench } from "lucide-react";

export default function MemberMaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-amber-50 to-yellow-100">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <Wrench className="h-10 w-10 text-amber-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-amber-800 mb-3">Website Under Maintenance</h1>
        <p className="text-muted-foreground text-lg">
          Our system is currently undergoing scheduled maintenance. 
          We will be back online shortly. Thank you for your patience.
        </p>
      </div>
    </div>
  );
}
