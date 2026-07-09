import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function OfficeHubStats({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{stat.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{stat.value}</div>
            <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
