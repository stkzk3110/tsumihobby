"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { ManualAddDialog } from "@/components/backlog/ManualAddDialog";
import { Search, Loader2, PenLine } from "lucide-react";
import type { ItemType, SearchResult } from "@/types";
import { Separator } from "@/components/ui/separator";

const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: "GAME", label: "ゲーム" },
  { value: "ANIME", label: "アニメ" },
  { value: "BOOK", label: "本" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ItemType>("GAME");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, type]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  function handleTabChange(value: string) {
    setType(value as ItemType);
    setResults([]);
    setSearched(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">検索して積む</h1>
          <p className="text-muted-foreground text-sm mt-1">
            ゲーム・アニメ・本を検索して積みリストに追加できます
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => setShowManual(true)}
        >
          <PenLine className="h-4 w-4" />
          手動で追加
        </Button>
      </div>

      <Tabs value={type} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 max-w-xs">
          {TYPE_OPTIONS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex gap-2">
        <Input
          placeholder={`${type === "GAME" ? "ゲーム" : type === "ANIME" ? "アニメ" : "本"}のタイトルを入力...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-md"
        />
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-1.5">検索</span>
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-10 space-y-3">
          <p className="text-muted-foreground">「{query}」の検索結果が見つかりませんでした</p>
          <Separator className="max-w-xs mx-auto" />
          <p className="text-sm text-muted-foreground">タイトルを直接入力して追加することもできます</p>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowManual(true)}>
            <PenLine className="h-4 w-4" />
            手動で追加する
          </Button>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {results.map((result) => (
            <SearchResultCard key={`${result.type}-${result.externalId}`} result={result} />
          ))}
        </div>
      )}

      <ManualAddDialog
        open={showManual}
        onClose={() => setShowManual(false)}
        defaultType={type}
      />
    </div>
  );
}
