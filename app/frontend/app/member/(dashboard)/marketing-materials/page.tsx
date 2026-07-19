"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Image, FileText, Video } from "lucide-react";

export default function MarketingMaterialsPage() {
  const { token } = useAuthStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    if (!token) return;
    apiPost("/api/member/ebooks/get_data", {}, token).then((res) => {
      if (res?.data) setMaterials(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const categories = ["all", ...new Set(materials.map((m: any) => m.category || "other"))];
  const filtered = category === "all" ? materials : materials.filter((m: any) => (m.category || "other") === category);

  const getIcon = (type: string) => {
    if (type?.includes("image")) return <Image className="h-5 w-5 text-blue-500" />;
    if (type?.includes("video")) return <Video className="h-5 w-5 text-red-500" />;
    return <FileText className="h-5 w-5 text-green-500" />;
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketing Materials</h1>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat)}
            className={category === cat ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No marketing materials found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((material: any) => (
            <Card key={material.id}>
              {material.thumbnail && (
                <div className="aspect-video bg-muted">
                  <img
                    src={material.thumbnail.startsWith("http") ? material.thumbnail : `${apiUrl}/storage/${material.thumbnail}`}
                    alt={material.title}
                    className="w-full h-full object-cover rounded-t"
                  />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {getIcon(material.file_type)}
                  <p className="font-semibold text-sm truncate">{material.title}</p>
                </div>
                {material.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{material.description}</p>
                )}
                {material.file_url && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={material.file_url.startsWith("http") ? material.file_url : `${apiUrl}/storage/${material.file_url}`} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" /> Download
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
