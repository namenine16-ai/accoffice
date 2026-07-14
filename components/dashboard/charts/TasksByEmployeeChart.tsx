"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";
import { chartPalette } from "./chartPalette";

export interface EmployeeTaskCount {
  employee: string;
  count: number;
  [key: string]: string | number;
}

interface TasksByEmployeeChartProps {
  data: EmployeeTaskCount[];
}

export function TasksByEmployeeChart({ data }: TasksByEmployeeChartProps) {
  return (
    <ChartCard
      title="งานตามพนักงาน"
      description="จำนวนงานประจำเดือนที่มอบหมายให้พนักงานแต่ละคน"
      tableColumns={[
        { key: "employee", label: "พนักงาน" },
        { key: "count", label: "จำนวนงาน" },
      ]}
      tableRows={data}
    >
      <ChartContainer height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartPalette.grid} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="employee"
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
          <Bar dataKey="count" name="งาน" fill={chartPalette.series2} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
