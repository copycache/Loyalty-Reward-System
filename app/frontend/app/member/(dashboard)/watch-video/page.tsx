"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function MemberWatchVideoPage() {
  const { token, currentSlot } = useAuthStore();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiPost("/api/member/get_video", { slot_id: currentSlot?.slot_id }, token).then((res) => {
      if (res?.data) setVideos(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const markWatched = async (videoId: number) => {
    try {
      await apiPost("/api/member/video_reward", { video_id: videoId, slot_id: currentSlot?.slot_id }, token);
      toast.success("Video marked as watched! Points earned.");
      // Refresh
      const res = await apiPost("/api/member/get_video", { slot_id: currentSlot?.slot_id }, token);
      if (res?.data) setVideos(res.data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark video.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Play className="h-6 w-6" /> Watch & Earn
      </h1>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Play className="h-10 w-10 mx-auto mb-2 opacity-50" />
            No videos available. Check back later!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video: any) => (
            <Card key={video.id}>
              <div className="aspect-video bg-muted relative">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover rounded-t" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                {video.watched && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Watched</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold text-sm">{video.title}</p>
                {video.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                )}
                {video.points && (
                  <p className="text-xs text-green-600">Earn {video.points} points</p>
                )}
                <div className="flex gap-2">
                  {video.url && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={video.url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-3 w-3 mr-1" /> Watch
                      </a>
                    </Button>
                  )}
                  {!video.watched && (
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => markWatched(video.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
