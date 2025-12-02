import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, Archive } from "lucide-react";
import { InventoryStats as Stats } from "@/types/inventory.types";

interface InventoryStatsProps {
  stats: Stats;
  isArabic: boolean;
}

export const InventoryStats = ({ stats, isArabic }: InventoryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'إجمالي الأصناف' : 'Total Items'}
              </p>
              <p className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'قيمة المخزون' : 'Inventory Value'}
              </p>
              <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'مخزون قليل' : 'Low Stock'}
              </p>
              <p className="text-2xl font-bold">{stats.lowStockItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Archive className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'نفد المخزون' : 'Out of Stock'}
              </p>
              <p className="text-2xl font-bold">{stats.outOfStockItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
