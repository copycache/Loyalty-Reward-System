"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Award, Gift } from "lucide-react";

export default function MemberIncentivePage() {
  const { token } = useAuthStore();
  const [incentives, setIncentives] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [incRes, qualRes] = await Promise.all([
          apiPost("/api/incentive/get_item", {}, token),
          apiPost("/api/incentive/getClaimedRewardItem", {}, token),
        ]);
        if (incRes?.data) setIncentives(incRes.data);
        if (qualRes?.data) setQualifications(qualRes.data);
      } catch {
        console.error("Failed to load incentives");
      }
      setLoading(false);
    };
    loadData();
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Incentives & Achievers</h1>

      {/* Available Incentives */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Available Incentives</h2>
        {incentives.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Gift className="h-10 w-10 mx-auto mb-2 opacity-50" />
              No incentives available at the moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incentives.map((inc: any) => (
              <Card key={inc.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{inc.name}</CardTitle>
                    <Award className="h-5 w-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{inc.description}</p>
                  {inc.reward && (
                    <p className="font-bold text-green-700">{inc.reward}</p>
                  )}
                  <Badge variant={inc.qualified ? "default" : "secondary"} className="mt-2">
                    {inc.qualified ? "Qualified" : "Not Yet Qualified"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Qualifications / Achievers */}
      {qualifications.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Achievers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {qualifications.map((q: any) => (
              <Card key={q.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                      {q.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.slot_no}</p>
                  </div>
                  <Badge>{q.incentive_name}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
