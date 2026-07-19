"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Radio, ExternalLink } from "lucide-react";

export default function MemberLiveStreamingPage() {
  const { token } = useAuthStore();
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiPost("/api/member/live/streaming/get_live_data", {}, token).then((res) => {
      if (res?.data) setStreams(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Radio className="h-6 w-6 text-red-500" /> Live Stream
      </h1>

      {streams.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Radio className="h-10 w-10 mx-auto mb-2 opacity-50" />
            No live streams available right now. Check back later!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streams.map((stream: any) => (
            <Card key={stream.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{stream.title}</CardTitle>
                  {stream.is_live && <Badge className="bg-red-500">LIVE</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {stream.thumbnail && (
                  <img src={stream.thumbnail} alt={stream.title} className="w-full h-40 object-cover rounded" />
                )}
                <p className="text-sm text-muted-foreground">{stream.description}</p>
                {stream.scheduled_at && (
                  <p className="text-xs text-muted-foreground">
                    Scheduled: {new Date(stream.scheduled_at).toLocaleString()}
                  </p>
                )}
                {stream.url && (
                  <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                    <a href={stream.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" /> Watch Now
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
