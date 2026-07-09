"use client";

import { ResponsiveContainer } from "recharts";

interface ChartContainerProps {
  height?: number;
  children: React.ReactElement;
}

export function ChartContainer({ height = 240, children }: ChartContainerProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );
}
