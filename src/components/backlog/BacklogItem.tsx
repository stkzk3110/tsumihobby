"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge } from "./TypeBadge";
import { ClearTimeDialog } from "./ClearTimeDialog";
import { UpdateStatusDialog } from "./UpdateStatusDialog";
import { Clock, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { BacklogItem as BacklogItemType } from "@/types";

interface Props {
  item: BacklogItemType;
  onUpdated: (updated: BacklogItemType) => void;
  onDeleted: (id: string) => void;
}

export function BacklogItemCard({ item, onUpdated, onDeleted }: Props) {
  const [showClearTime, setShowClearTime] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  async function handleDelete() {
    if (!confirm(`「${item.title}」を削除しますか？`)) return;
    const res = await fetch(`/api/backlog/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted(item.id);
      toast.success("削除しました");
    } else {
      toast.error("削除に失敗しました");
    }
  }

  function formatClearTime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}分`;
    if (m === 0) return `${h}時間`;
    return `${h}時間${m}分`;
  }

  return (
    <>
      <Card className="flex gap-3 p-3 hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div className="relative h-20 w-14 shrink-0 rounded overflow-hidden bg-muted">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="56px" unoptimized />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm leading-tight line-clamp-2">{item.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowStatus(true)}>
                  ステータス変更
                </DropdownMenuItem>
                {item.type === "GAME" && (
                  <DropdownMenuItem onClick={() => setShowClearTime(true)}>
                    クリア時間を記録
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
            {item.type === "GAME" && item.clearTimeMinutes ? (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatClearTime(item.clearTimeMinutes)}
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      {showClearTime && (
        <ClearTimeDialog
          item={item}
          open={showClearTime}
          onClose={() => setShowClearTime(false)}
          onUpdated={onUpdated}
        />
      )}
      {showStatus && (
        <UpdateStatusDialog
          item={item}
          open={showStatus}
          onClose={() => setShowStatus(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
