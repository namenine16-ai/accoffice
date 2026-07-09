import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityCardProps {
  title: string;
  description: string;
  timestamp: string;
}

export function ActivityCard({ title, description, timestamp }: ActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </CardContent>
    </Card>
  );
}
