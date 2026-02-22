import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BacklogByTypeChart } from "@/components/dashboard/BacklogByTypeChart";
import { CompletionTrendChart } from "@/components/dashboard/CompletionTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/backlog/StatusBadge";
import { TypeBadge } from "@/components/backlog/TypeBadge";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getStats(userId: string) {
  const allItems = await prisma.backlogItem.findMany({
    where: { userId },
    select: {
      type: true,
      status: true,
      completedAt: true,
      clearTimeMinutes: true,
    },
  });

  const completedItems = allItems.filter((i) => i.status === "COMPLETED");

  const totalBacklog = allItems.filter((i) => i.status === "BACKLOG").length;
  const totalInProgress = allItems.filter((i) => i.status === "IN_PROGRESS").length;
  const totalCompleted = completedItems.length;

  const byType = {
    GAME: allItems.filter((i) => i.type === "GAME").length,
    ANIME: allItems.filter((i) => i.type === "ANIME").length,
    BOOK: allItems.filter((i) => i.type === "BOOK").length,
  };

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCompleted = completedItems.filter(
    (i) => i.completedAt && new Date(i.completedAt) >= thisMonthStart
  ).length;

  const gamesWithTime = completedItems.filter((i) => i.type === "GAME" && i.clearTimeMinutes);
  const avgClearTimeMinutes =
    gamesWithTime.length > 0
      ? Math.round(gamesWithTime.reduce((acc, i) => acc + (i.clearTimeMinutes ?? 0), 0) / gamesWithTime.length)
      : null;

  const months: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = completedItems.filter(
      (item) =>
        item.completedAt &&
        new Date(item.completedAt) >= d &&
        new Date(item.completedAt) < end
    ).length;
    months.push({
      month: d.toLocaleDateString("ja-JP", { month: "short", year: "numeric" }),
      count,
    });
  }

  return { totalBacklog, totalInProgress, totalCompleted, byType, thisMonthCompleted, avgClearTimeMinutes, monthlyTrend: months };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [stats, recentItems] = await Promise.all([
    getStats(userId),
    prisma.backlogItem.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const hasData = stats.totalBacklog + stats.totalInProgress + stats.totalCompleted > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground text-sm mt-1">あなたの積み状況をひと目で確認</p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">まだ積みが登録されていません</p>
            <Button asChild>
              <Link href="/search">検索して積みを追加</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <StatsCards
            totalBacklog={stats.totalBacklog}
            totalInProgress={stats.totalInProgress}
            totalCompleted={stats.totalCompleted}
            thisMonthCompleted={stats.thisMonthCompleted}
            avgClearTimeMinutes={stats.avgClearTimeMinutes}
          />

          <div className="grid lg:grid-cols-2 gap-4">
            <BacklogByTypeChart byType={stats.byType} />
            <CompletionTrendChart data={stats.monthlyTrend} />
          </div>
        </>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">最近の積み</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/backlog" className="gap-1">
              すべて見る <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">まだ積みがありません</p>
          ) : (
            <div className="space-y-2">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-9 shrink-0 rounded overflow-hidden bg-muted">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="36px" unoptimized />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TypeBadge type={item.type} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
