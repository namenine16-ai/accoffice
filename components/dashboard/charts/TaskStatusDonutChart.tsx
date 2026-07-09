"use client";

import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartContainer } from "./ChartContainer";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { categoricalSeries } from "./chartPalette";

export interface TaskStatusCount {
  status: string;
  label: string;
  count: number;
}

interface TaskStatusDonutChartProps {
  data: TaskStatusCount[];
}

export function TaskStatusDonutChart({ data }: TaskStatusDonutChartProps) {
  return (
    <ChartCard
      title="สัดส่วนสถานะงาน"
      description="กระจายงานทั้งหมดตามสถานะปัจจุบัน"
      tableColumns={[
        { key: "label", label: "สถานะ" },
        { key: "count", label: "จำนวนงาน" },
      ]}
      tableRows={data.map((d) => ({ label: d.label, count: d.count }))}
    >
      <ChartContainer height={240}>
        <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <Tooltip content={(props) => <ChartTooltip {...props} />} />
          <Legend content={<ChartLegend />} />
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="var(--chart-surface)"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.status} fill={categoricalSeries[index % categoricalSeries.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </ChartCard>
  );
}
