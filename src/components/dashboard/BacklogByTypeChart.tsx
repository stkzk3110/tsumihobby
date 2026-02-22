"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TYPE_COLORS } from "@/types";

interface Props {
  byType: { GAME: number; ANIME: number; BOOK: number };
}

export function BacklogByTypeChart({ byType }: Props) {
  const data = [
    { name: "ゲーム", value: byType.GAME, color: TYPE_COLORS.GAME },
    { name: "アニメ", value: byType.ANIME, color: TYPE_COLORS.ANIME },
    { name: "本", value: byType.BOOK, color: TYPE_COLORS.BOOK },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">カテゴリ別内訳</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">データがありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">カテゴリ別内訳</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v}作品`, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
