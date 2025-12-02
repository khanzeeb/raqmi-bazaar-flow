import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Clock, CheckCircle, DollarSign } from "lucide-react";
import { ReturnStats as Stats } from "@/types/return.types";

interface ReturnStatsProps {
  stats: Stats;
  isArabic: boolean;
}

export const ReturnStats = ({ stats, isArabic }: ReturnStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <RotateCcw className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي المرتجعات" : "Total Returns"}
              </p>
              <p className="text-2xl font-bold">{stats.totalReturns}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "معلق" : "Pending"}
              </p>
              <p className="text-2xl font-bold">{stats.pendingReturns}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "مكتمل" : "Completed"}
              </p>
              <p className="text-2xl font-bold">{stats.completedReturns}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي المبالغ المستردة" : "Total Refunds"}
              </p>
              <p className="text-2xl font-bold">${stats.totalRefundAmount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
