"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatShortDate, formatUsd } from "@/lib/format";
import type { PricePoint } from "@/lib/types";

const config = {
  value: {
    label: "Value",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ValueChart({
  data,
  label,
}: {
  data: PricePoint[];
  label: string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 text-center text-sm text-muted-foreground">
        No two-month price series is available for this coin yet. Check the web
        sources below for recent asking prices.
      </div>
    );
  }

  const chartData = data.map((point) => ({
    t: point.t,
    date: formatShortDate(point.t),
    value: Number(point.value.toFixed(2)),
  }));

  return (
    <div className="space-y-2">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis
            width={64}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatUsd(value, 0)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const t = payload?.[0]?.payload?.t as number | undefined;
                  return t ? formatShortDate(t) : "";
                }}
                formatter={(value) => formatUsd(Number(value))}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
