import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { CustomerStats as Stats } from "@/types/customer.types";

interface CustomerStatsProps {
  stats: Stats;
  isArabic: boolean;
}

export const CustomerStats = ({ stats, isArabic }: CustomerStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي العملاء" : "Total Customers"}
              </p>
              <p className="text-2xl font-bold">{stats.totalCustomers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "نشط" : "Active"}
              </p>
              <p className="text-2xl font-bold">{stats.activeCustomers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "شركات" : "Business"}
              </p>
              <p className="text-2xl font-bold">{stats.businessCustomers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي الرصيد" : "Total Credit"}
              </p>
              <p className="text-2xl font-bold">{isArabic ? `${stats.totalCredit} ر.س` : `SAR ${stats.totalCredit}`}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي المستحق" : "Total Due"}
              </p>
              <p className="text-2xl font-bold">{isArabic ? `${stats.totalDue} ر.س` : `SAR ${stats.totalDue}`}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
