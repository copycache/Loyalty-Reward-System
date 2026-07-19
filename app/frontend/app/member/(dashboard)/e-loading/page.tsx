"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";

export default function MemberELoadingPage() {
  const { token } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) return;
    apiPost("/api/member_eloading/get_product_list", { page }, token).then((res) => {
      if (res?.data) {
        setHistory(res.data.data || res.data);
        setTotalPages(res.data.last_page || 1);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token, page]);

  const handleSubmit = async () => {
    if (!phone || !amount || !network) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/api/member_eloading/eloading_submit", { phone, amount, network }, token);
      toast.success("E-Load sent successfully!");
      setPhone("");
      setAmount("");
      setPage(1);
    } catch (err: any) {
      toast.error(err?.message || "E-Loading failed.");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Smartphone className="h-6 w-6" /> E-Loading
      </h1>

      <Tabs defaultValue="load">
        <TabsList>
          <TabsTrigger value="load">Buy Load</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="load">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Send E-Load</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger><SelectValue placeholder="Select network" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="globe">Globe</SelectItem>
                    <SelectItem value="smart">Smart</SelectItem>
                    <SelectItem value="sun">Sun</SelectItem>
                    <SelectItem value="tnt">TNT</SelectItem>
                    <SelectItem value="tm">TM</SelectItem>
                    <SelectItem value="dito">DITO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="09XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Amount (₱)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100, 200, 300, 500, 1000].map((a) => (
                    <Button key={a} variant={amount === String(a) ? "default" : "outline"} size="sm" onClick={() => setAmount(String(a))}
                      className={amount === String(a) ? "bg-green-600" : ""}>₱{a}</Button>
                  ))}
                </div>
                <Input type="number" placeholder="Or enter custom amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2" />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Load
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No e-loading history.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell className="text-sm">{h.created_at ? new Date(h.created_at).toLocaleDateString() : "-"}</TableCell>
                          <TableCell>{h.phone}</TableCell>
                          <TableCell>{h.network}</TableCell>
                          <TableCell className="font-semibold">₱{(parseFloat(h.amount) || 0).toLocaleString()}</TableCell>
                          <TableCell><Badge variant={h.status === "success" ? "default" : "secondary"}>{h.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
