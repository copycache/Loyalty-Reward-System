"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface WalletLogTableProps {
  walletTypes: any[];
}

export function WalletLogTable({ walletTypes }: WalletLogTableProps) {
  const { token, currentSlot } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWallet, setSelectedWallet] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    // Generate last 5 years
    const currentYear = new Date().getFullYear();
    const y = [];
    for (let i = 0; i < 5; i++) {
      y.push((currentYear - i).toString());
    }
    setYears(y);
  }, []);

  const toSafeString = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
  };

  useEffect(() => {
    if (walletTypes?.length > 0 && selectedWallet === "all") {
       // logic to set default wallet if needed, or keep "all"
       // Legacy seemed to default to a specific wallet. 
       // For parity, let's select the first one if "all" isn't supported by backend,
       // but legacy passed "currency_default" logic.
       // Let's assume we can pass currency_id.
       const defaultWallet = walletTypes.find((w: any) => w.currency_default === 1);
       if (defaultWallet) setSelectedWallet(toSafeString(defaultWallet.currency_id));
    }
  }, [walletTypes, selectedWallet]);

  useEffect(() => {
    if (!token || !currentSlot) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const payload = {
          slot_id: currentSlot.slot_id,
          month: selectedMonth,
          year: selectedYear,
          currency: selectedWallet === "all" ? "" : selectedWallet,
          page: currentPage,
        };

        const res = await apiPost("/api/wallet_log", payload, token);
        if (res.status === "success" || res.data) {
           // Support both Laravel standard paginate and custom structure
           const data = res.data?.data || res.data || [];
           setLogs(data);
           // Assume total or last_page is in res.data
           setTotalPages(res.data?.last_page || 1);
        }
      } catch (e) {
        console.error("Failed to fetch wallet logs", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token, currentSlot, currentPage, selectedWallet, selectedMonth, selectedYear]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const formatCurrency = (amount: number | string | null | undefined, currencyAbbrev?: string) => {
      const numericAmount = Number(amount ?? 0);
      return `${currencyAbbrev || ""} ${numericAmount.toLocaleString('en-PH', {minimumFractionDigits: 2})}`.trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
            <Select value={selectedWallet} onValueChange={(v) => { setSelectedWallet(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Wallet" />
            </SelectTrigger>
            <SelectContent>
                {walletTypes.map((w: any) => (
                <SelectItem key={w.wallet_id || toSafeString(w.currency_id)} value={toSafeString(w.currency_id)}>
                    {w.currency_name} ({w.currency_abbreviation})
                </SelectItem>
                ))}
            </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={(v) => { setSelectedMonth(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                    {m.label}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((y) => (
                <SelectItem key={y} value={y}>
                    {y}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Running Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow key={log.wallet_log_id || log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString()} <br/>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </TableCell>
                  <TableCell>{log.wallet_log_details}</TableCell>
                  <TableCell className={`text-right font-medium ${parseFloat(log.wallet_log_amount) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {parseFloat(log.wallet_log_amount) > 0 ? '+' : ''}{formatCurrency(log.wallet_log_amount, log.currency_abbreviation)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(log.wallet_log_running_balance, log.currency_abbreviation)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
