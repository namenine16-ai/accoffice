import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";

type DashboardCardVariant = "default" | "success" | "warning" | "destructive";

interface DashboardCardProps {
  title: string;
  value: number;
  subtitle: string;
  variant?: DashboardCardVariant;
}

const variantClasses: Record<DashboardCardVariant, string> = {
  default: "border-border bg-card",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  destructive: "border-destructive/20 bg-destructive/10 text-destructive",
};

export function DashboardCard({ title, value, subtitle, variant = "default" }: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", variantClasses[variant])}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold">{value}</div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
