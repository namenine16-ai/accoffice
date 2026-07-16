"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";
import { chartPalette } from "./chartPalette";

export interface MonthlySlaRate {
  month: string;
  onTimeRate: number;
  [key: string]: string | number;
}

interface SlaTrendChartProps {
  data: MonthlySlaRate[];
}

export function SlaTrendChart({ data }: SlaTrendChartProps) {
  return (
    <ChartCard
      title="แนวโน้ม SLA"
      description="อัตราการส่งงานตรงกำหนดย้อนหลัง 6 เดือน (%)"
      tableColumns={[
        { key: "month", label: "เดือน" },
        { key: "onTimeRate", label: "ตรงกำหนด (%)" },
      ]}
      tableRows={data}
    >
      <ChartContainer height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartPalette.grid} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: chartPalette.muted }}
            axisLine={{ stroke: chartPalette.axis }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: chartPalette.muted }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} />}
            cursor={{ fill: chartPalette.grid, opacity: 0.4 }}
          />
          <Bar dataKey="onTimeRate" name="ตรงกำหนด (%)" fill={chartPalette.statusGood} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
