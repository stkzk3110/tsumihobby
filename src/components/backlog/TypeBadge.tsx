import { Badge } from "@/components/ui/badge";
import type { ItemType } from "@/types";
import { Gamepad2, Tv, BookOpen } from "lucide-react";

const TYPE_CONFIG: Record<ItemType, { label: string; icon: React.ElementType; className: string }> = {
  GAME: { label: "ゲーム", icon: Gamepad2, className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  ANIME: { label: "アニメ", icon: Tv, className: "bg-pink-100 text-pink-700 border-pink-200" },
  BOOK: { label: "本", icon: BookOpen, className: "bg-amber-100 text-amber-700 border-amber-200" },
};

export function TypeBadge({ type }: { type: ItemType }) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
