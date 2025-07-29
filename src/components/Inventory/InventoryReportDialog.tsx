import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryItem } from "@/pages/Inventory";

interface InventoryReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export const InventoryReportDialog = ({ open, onOpenChange, item }: InventoryReportDialogProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  if (!item) return null;

  // Mock data for demonstration
  const salesData = [
    { month: isArabic ? 'يناير' : 'January', sales: 45, revenue: 45 * item.unitPrice },
    { month: isArabic ? 'فبراير' : 'February', sales: 38, revenue: 38 * item.unitPrice },
    { month: isArabic ? 'مارس' : 'March', sales: 52, revenue: 52 * item.unitPrice },
    { month: isArabic ? 'أبريل' : 'April', sales: 41, revenue: 41 * item.unitPrice },
  ];

  const totalSales = salesData.reduce((sum, data) => sum + data.sales, 0);
  const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0);
  const avgMonthlySales = totalSales / salesData.length;
  
  const stockTurnover = totalSales / ((item.currentStock + item.minimumStock) / 2);
  const profitMargin = ((item.unitPrice - item.unitCost) / item.unitPrice) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {isArabic ? 'تقرير المنتج' : 'Product Report'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{item.productName}</h3>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'الرمز:' : 'SKU:'} {item.sku}</p>
                </div>
                <Badge variant="outline">{item.category}</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'المخزون الحالي' : 'Current Stock'}</p>
                  <p className="text-xl font-bold">{item.currentStock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'قيمة المخزون' : 'Stock Value'}</p>
                  <p className="text-xl font-bold">{(item.currentStock * item.unitCost).toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'هامش الربح' : 'Profit Margin'}</p>
                  <p className="text-xl font-bold text-green-600">{profitMargin.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'معدل الدوران' : 'Turnover Rate'}</p>
                  <p className="text-xl font-bold">{stockTurnover.toFixed(1)}x</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Performance */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {isArabic ? 'أداء المبيعات (آخر 4 أشهر)' : 'Sales Performance (Last 4 Months)'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">{isArabic ? 'إحصائيات المبيعات' : 'Sales Statistics'}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{isArabic ? 'إجمالي المبيعات' : 'Total Sales'}</span>
                      <span className="font-medium">{totalSales} {isArabic ? 'وحدة' : 'units'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
                      <span className="font-medium">{totalRevenue.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{isArabic ? 'متوسط المبيعات الشهرية' : 'Avg Monthly Sales'}</span>
                      <span className="font-medium">{avgMonthlySales.toFixed(1)} {isArabic ? 'وحدة' : 'units'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">{isArabic ? 'المبيعات الشهرية' : 'Monthly Sales'}</h4>
                  <div className="space-y-2">
                    {salesData.map((data, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{data.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(data.sales / 60) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{data.sales}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {isArabic ? 'التوصيات' : 'Recommendations'}
              </h3>
              
              <div className="space-y-3">
                {item.currentStock <= item.minimumStock && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300">
                        {isArabic ? 'مخزون منخفض' : 'Low Stock Alert'}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {isArabic ? 'يُنصح بطلب توريد جديد للمحافظة على مستوى المخزون' : 'Consider reordering to maintain stock levels'}
                      </p>
                    </div>
                  </div>
                )}
                
                {stockTurnover > 6 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-300">
                        {isArabic ? 'أداء ممتاز' : 'Excellent Performance'}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {isArabic ? 'معدل دوران مخزون عالي، منتج مربح' : 'High turnover rate indicates strong product performance'}
                      </p>
                    </div>
                  </div>
                )}
                
                {profitMargin < 20 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-300">
                        {isArabic ? 'هامش ربح منخفض' : 'Low Profit Margin'}
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        {isArabic ? 'فكر في مراجعة الأسعار أو تقليل التكاليف' : 'Consider reviewing pricing strategy or reducing costs'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              {isArabic ? 'تصدير التقرير' : 'Export Report'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};