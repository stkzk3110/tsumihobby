"use client";

import { useState, useEffect, useCallback } from "react";
import { BacklogItemCard } from "@/components/backlog/BacklogItem";
import { ManualAddDialog } from "@/components/backlog/ManualAddDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, PenLine } from "lucide-react";
import type { BacklogItem, ItemType, ItemStatus } from "@/types";

const TYPE_FILTERS: { value: "ALL" | ItemType; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "GAME", label: "ゲーム" },
  { value: "ANIME", label: "アニメ" },
  { value: "BOOK", label: "本" },
];

const STATUS_FILTERS: { value: "ALL" | ItemStatus; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "BACKLOG", label: "積み" },
  { value: "IN_PROGRESS", label: "進行中" },
  { value: "COMPLETED", label: "完了" },
  { value: "DROPPED", label: "断念" },
];

export default function BacklogPage() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"ALL" | ItemType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ItemStatus>("ALL");
  const [search, setSearch] = useState("");
  const [showManual, setShowManual] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/backlog?${params.toString()}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = items.filter((item) =>
    search ? item.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  function handleUpdated(updated: BacklogItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">積みリスト</h1>
          <p className="text-muted-foreground text-sm mt-1">{items.length} 作品</p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShowManual(true)}
        >
          <PenLine className="h-4 w-4" />
          積みを追加
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="タイトルで絞り込み..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as "ALL" | ItemType)}>
          <TabsList>
            {TYPE_FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="text-xs">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "ALL" | ItemStatus)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">
            {search ? `「${search}」は見つかりませんでした` : "積みがまだありません"}
          </p>
          {!search && (
            <Button className="gap-1.5" onClick={() => setShowManual(true)}>
              <PenLine className="h-4 w-4" />
              最初の積みを追加
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <BacklogItemCard
              key={item.id}
              item={item}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      <ManualAddDialog
        open={showManual}
        onClose={() => setShowManual(false)}
        onAdded={fetchItems}
      />
    </div>
  );
}
