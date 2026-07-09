export const chartPalette = {
  series1: "var(--chart-series-1)",
  series2: "var(--chart-series-2)",
  series3: "var(--chart-series-3)",
  series4: "var(--chart-series-4)",
  statusGood: "var(--chart-status-good)",
  statusWarning: "var(--chart-status-warning)",
  statusSerious: "var(--chart-status-serious)",
  statusCritical: "var(--chart-status-critical)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  muted: "var(--chart-muted)",
  inkPrimary: "var(--chart-ink-primary)",
  inkSecondary: "var(--chart-ink-secondary)",
} as const;

export const categoricalSeries = [
  chartPalette.series1,
  chartPalette.series2,
  chartPalette.series3,
  chartPalette.series4,
] as const;
