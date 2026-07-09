"use client";

import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartContainer } from "./ChartContainer";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { chartPalette } from "./chartPalette";

export interface TaxFilingStatusCount {
  taxType: string;
  filed: number;
  pending: number;
  [key: string]: string | number;
}

interface TaxFilingStackedBarChartProps {
  data: TaxFilingStatusCount[];
}

export function TaxFilingStackedBarChart({ data }: TaxFilingStackedBarChartProps) {
  return (
    <ChartCard
      title="สถานะการยื่นภาษี"
      description="จำนวนงานที่ยื่นแล้วเทียบกับยังไม่ยื่น แยกตามประเภทภาษี"
      tableColumns={[
        { key: "taxType", label: "ประเภทภาษี" },
        { key: "filed", label: "ยื่นแล้ว" },
        { key: "pending", label: "ยังไม่ยื่น" },
      ]}
      tableRows={data}
    >
      <ChartContainer height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartPalette.grid} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="taxType"
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
          <Bar
            dataKey="filed"
            name="ยื่นแล้ว"
            stackId="tax"
            fill={chartPalette.statusGood}
            stroke="var(--chart-surface)"
            strokeWidth={2}
            maxBarSize={24}
          />
          <Bar
            dataKey="pending"
            name="ยังไม่ยื่น"
            stackId="tax"
            fill={chartPalette.muted}
            stroke="var(--chart-surface)"
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
