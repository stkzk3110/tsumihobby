"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { BacklogItem } from "@/types";

interface Props {
  item: BacklogItem;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: BacklogItem) => void;
}

export function ClearTimeDialog({ item, open, onClose, onUpdated }: Props) {
  const existingH = item.clearTimeMinutes ? Math.floor(item.clearTimeMinutes / 60) : 0;
  const existingM = item.clearTimeMinutes ? item.clearTimeMinutes % 60 : 0;
  const [hours, setHours] = useState(String(existingH));
  const [minutes, setMinutes] = useState(String(existingM));
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const h = parseInt(hours || "0", 10);
    const m = parseInt(minutes || "0", 10);
    if (isNaN(h) || isNaN(m)) return;
    const totalMinutes = h * 60 + m;

    setLoading(true);
    try {
      const res = await fetch(`/api/backlog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          clearTimeMinutes: totalMinutes,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onUpdated(data.item);
      toast.success("クリア時間を記録しました！");
      onClose();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>クリア時間を記録</DialogTitle>
          <p className="text-sm text-muted-foreground">{item.title}</p>
        </DialogHeader>

        <div className="flex gap-4 py-2">
          <div className="flex-1">
            <Label htmlFor="hours">時間</Label>
            <div className="flex items-center gap-1 mt-1">
              <Input
                id="hours"
                type="number"
                min="0"
                max="9999"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="text-right"
              />
              <span className="text-sm text-muted-foreground">h</span>
            </div>
          </div>
          <div className="flex-1">
            <Label htmlFor="minutes">分</Label>
            <div className="flex items-center gap-1 mt-1">
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="text-right"
              />
              <span className="text-sm text-muted-foreground">m</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "クリア完了！"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
