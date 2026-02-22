import { Badge } from "@/components/ui/badge";
import type { ItemStatus } from "@/types";

const STATUS_CONFIG: Record<ItemStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  BACKLOG: { label: "積み", variant: "secondary", className: "bg-slate-100 text-slate-700 border-slate-200" },
  IN_PROGRESS: { label: "進行中", variant: "default", className: "bg-blue-100 text-blue-700 border-blue-200" },
  COMPLETED: { label: "完了", variant: "default", className: "bg-green-100 text-green-700 border-green-200" },
  DROPPED: { label: "断念", variant: "destructive", className: "bg-red-100 text-red-700 border-red-200" },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
