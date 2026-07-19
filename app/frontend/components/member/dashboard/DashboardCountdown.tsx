"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface DashboardCountdownProps {
  resetDate?: string;
  resetDays?: number;
  realtimeCommission?: number;
}

export function DashboardCountdown({ resetDate, resetDays, realtimeCommission }: DashboardCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  useEffect(() => {
    if (realtimeCommission !== 0 || !resetDate || resetDays === undefined) return;

    try {
      const baseDate = new Date(resetDate);
      if (isNaN(baseDate.getTime())) return;

      const newDate = new Date(baseDate);
      newDate.setDate(newDate.getDate() + Number(resetDays));
      setTargetDate(newDate);
    } catch (e) {
      console.error("Invalid date for countdown", e);
    }
  }, [resetDate, resetDays, realtimeCommission]);

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft("We'll be back shortly!");
        clearInterval(interval);
        // Optionally reload page like legacy
        // window.location.reload(); 
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const pad = (n: number) => (n < 10 ? `0${n}` : n);
      
      const parts = [];
      if (days > 0) parts.push(`${pad(days)}d`);
      if (days > 0 || hours > 0) parts.push(`${pad(hours)}h`);
      if (days > 0 || hours > 0 || minutes > 0) parts.push(`${pad(minutes)}m`);
      parts.push(`${pad(seconds)}s`);

      setTimeLeft(parts.join(" : "));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || realtimeCommission !== 0) return null;

  return (
    <Card className="bg-amber-50 border-amber-200 mb-6">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-amber-800">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Binary Commission Cut-off</span>
        </div>
        <div className="text-2xl font-bold text-amber-900 font-mono tracking-wider">
          {timeLeft || "Calculating..."}
        </div>
      </CardContent>
    </Card>
  );
}
