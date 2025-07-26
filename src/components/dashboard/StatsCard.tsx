import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  trend = "stable",
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("glass hover-lift transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold gradient-text">
              {value}
            </p>
            {change && (
              <p
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  changeType === "positive" && "text-success",
                  changeType === "negative" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" && "↗"}
                {trend === "down" && "↘"}
                {trend === "stable" && "→"}
                {change}
              </p>
            )}
          </div>
          <div className="p-3 bg-gradient-card rounded-lg border border-accent/20">
            <Icon className="h-6 w-6 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}