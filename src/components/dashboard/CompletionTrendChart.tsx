"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  data: { month: string; count: number }[];
}

export function CompletionTrendChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">月別完了数（過去6ヶ月）</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}作品`, "完了数"]} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: "#6366f1" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
