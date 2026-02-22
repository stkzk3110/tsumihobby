"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TypeBadge } from "@/components/backlog/TypeBadge";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import type { SearchResult } from "@/types";

export function SearchResultCard({ result }: { result: SearchResult }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch("/api/backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error();
      setAdded(true);
      toast.success(`「${result.title}」を積みに追加しました`);
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex gap-3 p-3 hover:shadow-md transition-shadow">
      <div className="relative h-20 w-14 shrink-0 rounded overflow-hidden bg-muted">
        {result.imageUrl ? (
          <Image
            src={result.imageUrl}
            alt={result.title}
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm leading-tight line-clamp-2">{result.title}</h3>
        {result.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {result.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <TypeBadge type={result.type} />
          <Button
            size="sm"
            variant={added ? "secondary" : "default"}
            onClick={handleAdd}
            disabled={loading || added}
            className="h-7 text-xs"
          >
            {added ? (
              <>
                <Check className="h-3 w-3 mr-1" /> 追加済み
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 mr-1" /> 積む
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
