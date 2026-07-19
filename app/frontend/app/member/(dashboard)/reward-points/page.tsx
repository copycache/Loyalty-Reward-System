"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function MemberRewardPointsPage() {
  const { token } = useAuthStore();
  const [points, setPoints] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [ptsRes, histRes] = await Promise.all([
          apiPost("/api/reward_points/get_item", {}, token),
          apiPost("/api/reward_points/getClaimedRewardItem", { page }, token),
        ]);
        if (ptsRes?.data) setPoints(ptsRes.data);
        if (histRes?.data) {
          setHistory(histRes.data.data || histRes.data);
          setTotalPages(histRes.data.last_page || 1);
        }
      } catch {
        console.error("Failed to load reward points");
      }
      setLoading(false);
    };
    loadData();
  }, [token, page]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reward Points</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Points Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              {points?.total_earned || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Available Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{points?.available || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Used Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{points?.used || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No points history.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-sm">{h.created_at ? new Date(h.created_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-sm">{h.description || "-"}</TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={h.type === "earned" ? "text-green-600" : "text-red-600"}>
                          {h.type === "earned" ? "+" : "-"}{h.points}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={h.type === "earned" ? "default" : "secondary"}>{h.type}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
