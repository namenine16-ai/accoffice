"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";
import { chartPalette } from "./chartPalette";

export interface CategoryCount {
  label: string;
  count: number;
  [key: string]: string | number;
}

interface CustomerCountByCategoryChartProps {
  title: string;
  description?: string;
  data: CategoryCount[];
}

export function CustomerCountByCategoryChart({ title, description, data }: CustomerCountByCategoryChartProps) {
  return (
    <ChartCard
      title={title}
      description={description}
      tableColumns={[
        { key: "label", label: "หมวดหมู่" },
        { key: "count", label: "จำนวนลูกค้า" },
      ]}
      tableRows={data}
    >
      <ChartContainer height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartPalette.grid} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: chartPalette.muted }}
            axisLine={{ stroke: chartPalette.axis }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: chartPalette.muted }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} />}
            cursor={{ fill: chartPalette.grid, opacity: 0.4 }}
          />
          <Bar dataKey="count" name="ลูกค้า" fill={chartPalette.series3} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
