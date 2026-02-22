import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [allItems, completedItems] = await Promise.all([
    prisma.backlogItem.findMany({
      where: { userId },
      select: {
        type: true,
        status: true,
        completedAt: true,
        clearTimeMinutes: true,
      },
    }),
    prisma.backlogItem.findMany({
      where: { userId, status: "COMPLETED" },
      select: {
        type: true,
        completedAt: true,
        clearTimeMinutes: true,
      },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  // Summary counts
  const totalBacklog = allItems.filter((i) => i.status === "BACKLOG").length;
  const totalInProgress = allItems.filter((i) => i.status === "IN_PROGRESS").length;
  const totalCompleted = allItems.filter((i) => i.status === "COMPLETED").length;
  const totalDropped = allItems.filter((i) => i.status === "DROPPED").length;

  // By type breakdown
  const byType = {
    GAME: allItems.filter((i) => i.type === "GAME").length,
    ANIME: allItems.filter((i) => i.type === "ANIME").length,
    BOOK: allItems.filter((i) => i.type === "BOOK").length,
  };

  // This month completions
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCompleted = completedItems.filter(
    (i) => i.completedAt && new Date(i.completedAt) >= thisMonthStart
  ).length;

  // Average clear time for games
  const gamesWithTime = completedItems.filter(
    (i) => i.type === "GAME" && i.clearTimeMinutes
  );
  const avgClearTimeMinutes =
    gamesWithTime.length > 0
      ? Math.round(
          gamesWithTime.reduce((acc, i) => acc + (i.clearTimeMinutes ?? 0), 0) /
            gamesWithTime.length
        )
      : null;

  // Monthly completion trend (last 6 months)
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

  return NextResponse.json({
    totalBacklog,
    totalInProgress,
    totalCompleted,
    totalDropped,
    byType,
    thisMonthCompleted,
    avgClearTimeMinutes,
    monthlyTrend: months,
  });
}
