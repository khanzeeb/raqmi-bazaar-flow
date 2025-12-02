import { Card, CardContent } from "@/components/ui/card";
import { PricingStats as Stats } from "@/types/pricing.types";

interface PricingStatsProps {
  stats: Stats;
  isArabic: boolean;
}

export const PricingStats = ({ stats, isArabic }: PricingStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.activeRules}</div>
          <p className="text-sm text-muted-foreground">
            {isArabic ? "قواعد نشطة" : "Active Rules"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.totalUsage}</div>
          <p className="text-sm text-muted-foreground">
            {isArabic ? "إجمالي الاستخدام" : "Total Usage"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.promoCodes}</div>
          <p className="text-sm text-muted-foreground">
            {isArabic ? "أكواد الخصم" : "Promo Codes"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.averageDiscount}%</div>
          <p className="text-sm text-muted-foreground">
            {isArabic ? "متوسط الخصم" : "Average Discount"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
