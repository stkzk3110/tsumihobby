"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { ItemType } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
  defaultType?: ItemType;
}

const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: "GAME", label: "ゲーム" },
  { value: "ANIME", label: "アニメ" },
  { value: "BOOK", label: "本" },
];

export function ManualAddDialog({ open, onClose, onAdded, defaultType = "GAME" }: Props) {
  const [type, setType] = useState<ItemType>(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [totalEpisodes, setTotalEpisodes] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setTotalEpisodes("");
    setTotalPages("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const metadata: Record<string, unknown> = {};
    if (type === "ANIME" && totalEpisodes) metadata.episodes = Number(totalEpisodes);
    if (type === "BOOK" && totalPages) metadata.totalPages = Number(totalPages);

    setLoading(true);
    try {
      const res = await fetch("/api/backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          externalId: `manual-${Date.now()}`,
          metadata: Object.keys(metadata).length > 0 ? metadata : null,
          ...(type === "ANIME" && totalEpisodes
            ? { totalEpisodes: Number(totalEpisodes) }
            : {}),
          ...(type === "BOOK" && totalPages
            ? { totalPages: Number(totalPages) }
            : {}),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`「${title}」を積みに追加しました`);
      reset();
      onAdded?.();
      onClose();
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>手動で積みに追加</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <Label className="mb-1.5 block">カテゴリ</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as ItemType)}>
              <TabsList className="grid w-full grid-cols-3">
                {TYPE_OPTIONS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="mb-1.5 block">
              タイトル <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder={
                type === "GAME"
                  ? "例: ゼルダの伝説 ティアーズ オブ ザ キングダム"
                  : type === "ANIME"
                  ? "例: 進撃の巨人"
                  : "例: 鬼滅の刃 1巻"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-1.5 block">
              メモ・説明
              <span className="text-muted-foreground text-xs ml-1">（任意）</span>
            </Label>
            <Input
              id="description"
              placeholder={
                type === "GAME"
                  ? "例: アクションRPG、Nintendo Switch"
                  : type === "ANIME"
                  ? "例: 全話視聴予定"
                  : "例: 著者名など"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Type-specific fields */}
          {type === "ANIME" && (
            <div>
              <Label htmlFor="episodes" className="mb-1.5 block">
                総話数
                <span className="text-muted-foreground text-xs ml-1">（任意）</span>
              </Label>
              <Input
                id="episodes"
                type="number"
                min="1"
                placeholder="例: 26"
                value={totalEpisodes}
                onChange={(e) => setTotalEpisodes(e.target.value)}
              />
            </div>
          )}

          {type === "BOOK" && (
            <div>
              <Label htmlFor="pages" className="mb-1.5 block">
                総ページ数
                <span className="text-muted-foreground text-xs ml-1">（任意）</span>
              </Label>
              <Input
                id="pages"
                type="number"
                min="1"
                placeholder="例: 320"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
              />
            </div>
          )}

          {/* Image URL */}
          <div>
            <Label htmlFor="imageUrl" className="mb-1.5 block">
              画像URL
              <span className="text-muted-foreground text-xs ml-1">（任意）</span>
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "追加中..." : "積む！"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
