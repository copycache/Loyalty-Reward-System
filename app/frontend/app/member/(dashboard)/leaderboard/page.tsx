"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal, Crown } from "lucide-react";

export default function MemberLeaderboardPage() {
  const { token } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("weekly");

  const fetchLeaderboard = async (p: string) => {
    setLoading(true);
    try {
      const res = await apiPost("/api/member/leaderboard/load_topearner", { period: p }, token);
      if (res?.data) setLeaderboard(res.data);
    } catch {
      console.error("Failed to load leaderboard");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchLeaderboard(period);
  }, [token, period]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-amber-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="h-6 w-6 text-amber-500" /> Leaderboard
      </h1>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all_time">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No leaderboard data.</div>
          ) : (
            <div className="divide-y">
              {leaderboard.map((entry: any, i: number) => (
                <div key={entry.id || i} className={`flex items-center gap-4 p-4 ${i < 3 ? "bg-amber-50/50" : ""}`}>
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(i)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                      {entry.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.slot_no}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">
                      ₱{(parseFloat(entry.total_earnings || entry.amount || 0)).toLocaleString()}
                    </p>
                    {entry.rank_name && (
                      <Badge variant="outline" className="text-xs">{entry.rank_name}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
