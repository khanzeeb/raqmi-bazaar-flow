import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Clock, CheckCircle, DollarSign } from "lucide-react";
import { ReturnStats } from "@/types/return.types";

interface ReturnsStatsCardsProps {
  stats: ReturnStats;
  isArabic: boolean;
}

export const ReturnsStatsCards = ({ stats, isArabic }: ReturnsStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-blue-500" />
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
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "معلقة" : "Pending"}
              </p>
              <p className="text-2xl font-bold">{stats.pendingReturns}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "مكتملة" : "Completed"}
              </p>
              <p className="text-2xl font-bold">{stats.completedReturns}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي المسترد" : "Total Refunded"}
              </p>
              <p className="text-2xl font-bold">${stats.totalRefundAmount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
