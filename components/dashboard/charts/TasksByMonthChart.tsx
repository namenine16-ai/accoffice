"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";
import { chartPalette } from "./chartPalette";

export interface MonthlyTaskCount {
  month: string;
  count: number;
  [key: string]: string | number;
}

interface TasksByMonthChartProps {
  data: MonthlyTaskCount[];
}

export function TasksByMonthChart({ data }: TasksByMonthChartProps) {
  return (
    <ChartCard
      title="งานรายเดือน"
      description="จำนวนงานประจำเดือนทั้งหมดย้อนหลัง 6 เดือน"
      tableColumns={[
        { key: "month", label: "เดือน" },
        { key: "count", label: "จำนวนงาน" },
      ]}
      tableRows={data}
    >
      <ChartContainer height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ stroke: chartPalette.axis, strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="count"
            name="งาน"
            stroke={chartPalette.series1}
            strokeWidth={2}
            dot={{ r: 4, fill: chartPalette.series1, strokeWidth: 2, stroke: "var(--chart-surface)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}
