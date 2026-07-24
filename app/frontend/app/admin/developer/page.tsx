"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost, API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Terminal,
  Info,
  List,
  FileText,
  RefreshCw,
  Copy,
  Server,
  Database,
  Globe,
  Clock,
} from "lucide-react";

interface SystemInfo {
  php_version?: string;
  laravel_version?: string;
  server_software?: string;
  database?: string;
  app_name?: string;
  app_env?: string;
  app_debug?: boolean;
  app_url?: string;
  timezone?: string;
  memory_limit?: string;
  max_execution_time?: string;
  upload_max_filesize?: string;
  [key: string]: unknown;
}

interface LogEntry {
  id?: number;
  level: string;
  message: string;
  context?: string;
  created_at: string;
}

interface DeveloperInfo {
  system?: SystemInfo;
  endpoints?: string[];
  logs?: LogEntry[];
  [key: string]: unknown;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

export default function AdminDeveloperPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<DeveloperInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("system");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadInfo = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await apiPost<DeveloperInfo>("/api/admin/developer/info", {}, token);
      setData(res);
    } catch {
      toast.error("Failed to load developer info");
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  const endpoints = Array.isArray(data?.endpoints)
    ? data.endpoints
    : [];

  const logs = Array.isArray(data?.logs)
    ? data.logs
    : [];

  const getLogBadge = (level: string) => {
    const lower = level.toLowerCase();
    const isError = ["error", "critical", "alert", "emergency"].includes(lower);
    const isWarning = lower === "warning";
    const isInfo = lower === "info";
    return (
      <Badge
        variant={isError ? "destructive" : isWarning ? "secondary" : isInfo ? "default" : "secondary"}
        className={isWarning ? "bg-yellow-100 text-yellow-800" : ""}
      >
        {level}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">Developer Settings</h1>
          <p className="text-muted-foreground">System information and developer tools</p>
        </div>
        <Button variant="outline" onClick={loadInfo}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="system">
              <Server className="h-4 w-4 mr-2" />
              System Info
            </TabsTrigger>
            <TabsTrigger value="endpoints">
              <List className="h-4 w-4 mr-2" />
              API Endpoints
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="h-4 w-4 mr-2" />
              Log Viewer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <InfoRow label="App Name" value={data?.system?.app_name || ""} />
                  <InfoRow label="Environment" value={data?.system?.app_env || ""} />
                  <InfoRow label="App URL" value={data?.system?.app_url || ""} />
                  <InfoRow label="Debug Mode" value={data?.system?.app_debug ? "Yes" : "No"} />
                  <InfoRow label="PHP Version" value={data?.system?.php_version || ""} />
                  <InfoRow label="Laravel Version" value={data?.system?.laravel_version || ""} />
                  <InfoRow label="Server" value={data?.system?.server_software || ""} />
                  <InfoRow label="Database" value={data?.system?.database || ""} />
                  <InfoRow label="Timezone" value={data?.system?.timezone || ""} />
                  <InfoRow label="Memory Limit" value={data?.system?.memory_limit || ""} />
                  <InfoRow label="Max Execution" value={data?.system?.max_execution_time || ""} />
                  <InfoRow label="Upload Max" value={data?.system?.upload_max_filesize || ""} />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Base URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="block bg-muted p-3 rounded-lg text-sm break-all">
                  {API_BASE_URL}
                </code>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                {endpoints.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">
                    No endpoints data available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {endpoints.map((ep: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-muted p-2 rounded-lg"
                      >
                        <code className="text-sm">{ep}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(ep, i)}
                        >
                          {copiedIndex === i ? (
                            <span className="text-xs text-green-600">Copied</span>
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">
                    No logs available
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {logs.map((log, i) => (
                      <div key={log.id || i} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          {getLogBadge(log.level)}
                          <span className="text-xs text-muted-foreground">
                            {log.created_at
                              ? new Date(log.created_at).toLocaleString()
                              : "—"}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.context && (
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {log.context}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
