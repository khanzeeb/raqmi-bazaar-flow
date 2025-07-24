import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  isArabic?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor,
  isArabic = false 
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "bg-success/10 text-success";
      case "decrease":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getChangeSymbol = () => {
    switch (changeType) {
      case "increase":
        return "↗";
      case "decrease":
        return "↘";
      default:
        return "→";
    }
  };

  return (
    <div className="card-stats group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10 ${iconColor.replace('icon-', 'bg-icon-')}/10`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <Badge variant="secondary" className={getChangeColor()}>
          <span className="mr-1">{getChangeSymbol()}</span>
          {change}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {isArabic ? "آخر 30 يوم" : "Last 30 days"}
        </span>
      </div>
    </div>
  );
}