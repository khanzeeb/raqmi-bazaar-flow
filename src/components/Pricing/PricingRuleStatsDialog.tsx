import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PricingRule } from "@/pages/Pricing";

interface PricingRuleStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: PricingRule | null;
}

export const PricingRuleStatsDialog: React.FC<PricingRuleStatsDialogProps> = ({
  open,
  onOpenChange,
  rule
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  if (!rule) return null;

  // Mock statistics data - in a real app this would come from your backend
  const stats = {
    totalUsage: rule.usageCount,
    maxUsage: rule.maxUsage || Infinity,
    totalSavings: 45000, // Total amount saved by customers
    avgOrderValue: 1250, // Average order value when rule is applied
    conversionRate: 78, // Percentage of eligible orders that used the rule
    uniqueCustomers: 32, // Number of unique customers who used the rule
    recentUsage: [
      { date: '2024-01-29', usage: 5 },
      { date: '2024-01-28', usage: 8 },
      { date: '2024-01-27', usage: 3 },
      { date: '2024-01-26', usage: 12 },
      { date: '2024-01-25', usage: 7 },
      { date: '2024-01-24', usage: 6 },
      { date: '2024-01-23', usage: 4 }
    ],
    topCategories: [
      { name: isArabic ? 'إلكترونيات' : 'Electronics', usage: 18 },
      { name: isArabic ? 'إكسسوارات' : 'Accessories', usage: 12 },
      { name: isArabic ? 'ملابس' : 'Clothing', usage: 8 },
      { name: isArabic ? 'منزل وحديقة' : 'Home & Garden', usage: 7 }
    ]
  };

  const usagePercentage = rule.maxUsage ? (rule.usageCount / rule.maxUsage) * 100 : 0;
  const isNearingLimit = usagePercentage > 80;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {isArabic ? `إحصائيات: ${rule.name}` : `Statistics: ${rule.name}`}
          </DialogTitle>
          <DialogDescription>
            {isArabic ? "عرض تفصيلي لأداء واستخدام قاعدة التسعير" : "Detailed view of pricing rule performance and usage"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "مرات الاستخدام" : "Usage Count"}
                    </p>
                    <p className="text-2xl font-bold">{stats.totalUsage}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>
                {rule.maxUsage && (
                  <div className="mt-2">
                    <Progress value={usagePercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? `من ${rule.maxUsage}` : `of ${rule.maxUsage}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "إجمالي التوفير" : "Total Savings"}
                    </p>
                    <p className="text-2xl font-bold">{stats.totalSavings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? "ر.س" : "SAR"}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "عملاء مميزون" : "Unique Customers"}
                    </p>
                    <p className="text-2xl font-bold">{stats.uniqueCustomers}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "معدل التحويل" : "Conversion Rate"}
                    </p>
                    <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Alert */}
          {isNearingLimit && rule.maxUsage && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">
                    {isArabic ? 
                      "تحذير: هذه القاعدة تقترب من الحد الأقصى للاستخدام" :
                      "Warning: This rule is approaching its usage limit"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Usage Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {isArabic ? "الاستخدام الأخير (7 أيام)" : "Recent Usage (7 days)"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentUsage.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(day.usage / 12) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{day.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isArabic ? "الفئات الأكثر استخداماً" : "Top Categories"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <Badge variant="outline">{category.usage}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? "مؤشرات الأداء" : "Performance Metrics"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.avgOrderValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "متوسط قيمة الطلب (ر.س)" : "Avg Order Value (SAR)"}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {(stats.totalSavings / stats.totalUsage).toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "متوسط التوفير لكل طلب (ر.س)" : "Avg Savings per Order (SAR)"}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(stats.totalUsage / 7)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "متوسط الاستخدام اليومي" : "Daily Usage Average"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rule Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? "تفاصيل القاعدة" : "Rule Details"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? "النوع" : "Type"}</p>
                  <p className="font-medium">{rule.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? "الحالة" : "Status"}</p>
                  <Badge className={rule.status === 'active' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}>
                    {rule.status === 'active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? "الأولوية" : "Priority"}</p>
                  <p className="font-medium">{rule.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isArabic ? "تاريخ الإنشاء" : "Created Date"}</p>
                  <p className="font-medium">{rule.createdAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};