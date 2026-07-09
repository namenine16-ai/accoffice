"use client";

import type { TooltipContentProps } from "recharts";

interface ChartTooltipProps extends TooltipContentProps {
  valueFormatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, valueFormatter = (v) => String(v) }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`${entry.dataKey ?? entry.name ?? index}`} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-0.5 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-semibold text-foreground">
              {valueFormatter(typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0))}
            </span>
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
