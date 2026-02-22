import { Card, CardContent } from "@/components/ui/card";
import { Layers, TrendingUp, CheckCircle2, Clock } from "lucide-react";

interface Props {
  totalBacklog: number;
  totalInProgress: number;
  totalCompleted: number;
  thisMonthCompleted: number;
  avgClearTimeMinutes: number | null;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

export function StatsCards({ totalBacklog, totalInProgress, totalCompleted, thisMonthCompleted, avgClearTimeMinutes }: Props) {
  const stats = [
    {
      label: "積み総数",
      value: totalBacklog,
      unit: "作品",
      icon: Layers,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      label: "進行中",
      value: totalInProgress,
      unit: "作品",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "今月クリア",
      value: thisMonthCompleted,
      unit: "作品",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "平均クリア時間",
      value: avgClearTimeMinutes ? formatTime(avgClearTimeMinutes) : "—",
      unit: avgClearTimeMinutes ? "" : "",
      icon: Clock,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className={`p-1.5 rounded-md ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{s.value}</span>
                {s.unit && <span className="text-sm text-muted-foreground">{s.unit}</span>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
