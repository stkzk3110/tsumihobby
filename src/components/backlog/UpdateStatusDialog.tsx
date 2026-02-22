"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { BacklogItem, ItemStatus } from "@/types";

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "BACKLOG", label: "積み" },
  { value: "IN_PROGRESS", label: "進行中" },
  { value: "COMPLETED", label: "完了" },
  { value: "DROPPED", label: "断念" },
];

interface Props {
  item: BacklogItem;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: BacklogItem) => void;
}

export function UpdateStatusDialog({ item, open, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState<ItemStatus>(item.status);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/backlog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onUpdated(data.item);
      toast.success("ステータスを更新しました");
      onClose();
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>ステータス変更</DialogTitle>
          <p className="text-sm text-muted-foreground line-clamp-1">{item.title}</p>
        </DialogHeader>

        <div className="py-2">
          <Label>ステータス</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ItemStatus)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "更新中..." : "更新"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
