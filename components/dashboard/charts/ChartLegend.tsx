"use client";

import type { LegendPayload } from "recharts";

interface ChartLegendProps {
  payload?: ReadonlyArray<LegendPayload>;
}

export function ChartLegend({ payload }: ChartLegendProps) {
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  );
}
