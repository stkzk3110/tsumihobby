import type { ItemType, ItemStatus } from "@/generated/prisma/client";

export type { ItemType, ItemStatus };

export interface BacklogItem {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  imageUrl: string | null;
  externalId: string | null;
  description: string | null;
  status: ItemStatus;
  addedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  clearTimeMinutes: number | null;
  totalEpisodes: number | null;
  currentEpisode: number | null;
  totalPages: number | null;
  currentPage: number | null;
  metadata: Record<string, unknown> | null;
}

export interface SearchResult {
  externalId: string;
  type: ItemType;
  title: string;
  imageUrl: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
}

export const TYPE_LABELS: Record<ItemType, string> = {
  GAME: "ゲーム",
  ANIME: "アニメ",
  BOOK: "本",
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  BACKLOG: "積み",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
  DROPPED: "断念",
};

export const TYPE_COLORS: Record<ItemType, string> = {
  GAME: "#6366f1",
  ANIME: "#ec4899",
  BOOK: "#f59e0b",
};

export const STATUS_COLORS: Record<ItemStatus, string> = {
  BACKLOG: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  DROPPED: "#ef4444",
};
