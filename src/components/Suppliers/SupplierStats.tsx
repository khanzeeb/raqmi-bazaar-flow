import { Card, CardContent } from "@/components/ui/card";
import { Truck, Plus, Users } from "lucide-react";
import { SupplierStats as Stats } from "@/types/supplier.types";

interface SupplierStatsProps {
  stats: Stats;
  isArabic: boolean;
}

export const SupplierStats = ({ stats, isArabic }: SupplierStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي الموردين" : "Total Suppliers"}
              </p>
              <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Truck className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "نشط" : "Active"}
              </p>
              <p className="text-2xl font-bold">{stats.activeSuppliers}</p>
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
                {isArabic ? "غير نشط" : "Inactive"}
              </p>
              <p className="text-2xl font-bold">{stats.inactiveSuppliers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "حد الائتمان" : "Credit Limit"}
              </p>
              <p className="text-2xl font-bold">
                {isArabic ? `${stats.totalCreditLimit} ر.س` : `SAR ${stats.totalCreditLimit}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Truck className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "إجمالي المشتريات" : "Total Spent"}
              </p>
              <p className="text-2xl font-bold">
                {isArabic ? `${stats.totalSpent} ر.س` : `SAR ${stats.totalSpent}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
