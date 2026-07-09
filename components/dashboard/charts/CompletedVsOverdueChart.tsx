"use client";

import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartContainer } from "./ChartContainer";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartPalette } from "./chartPalette";

export interface MonthlyCompletionCount {
  month: string;
  completed: number;
  overdue: number;
  [key: string]: string | number;
}

interface CompletedVsOverdueChartProps {
  data: MonthlyCompletionCount[];
}

export function CompletedVsOverdueChart({ data }: CompletedVsOverdueChartProps) {
  return (
    <ChartCard
      title="งานเสร็จเทียบกับงานค้าง"
      description="เปรียบเทียบงานที่เสร็จสิ้นและงานที่เลยกำหนดในแต่ละเดือน"
      tableColumns={[
        { key: "month", label: "เดือน" },
        { key: "completed", label: "เสร็จสิ้น" },
        { key: "overdue", label: "ค้างส่ง" },
      ]}
      tableRows={data}
    >
      <ChartContainer height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke={chartPalette.grid} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="month"
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
          <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ fill: chartPalette.grid, opacity: 0.4 }} />
          <Legend content={<ChartLegend />} />
          <Bar dataKey="completed" name="เสร็จสิ้น" fill={chartPalette.statusGood} radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="overdue" name="ค้างส่ง" fill={chartPalette.statusCritical} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
