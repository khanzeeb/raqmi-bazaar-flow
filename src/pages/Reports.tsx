import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRTL } from "@/hooks/useRTL";
import { useReportsData } from "@/hooks/reports";
import { ReportFilters } from "@/components/Reports/ReportFilters";
import { KPICards } from "@/components/Reports/KPICards";

const Reports = () => {
  const { isArabic, isRTL } = useRTL();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const { salesData, productCategoryData, topProductsData, expenseData, kpiData } = useReportsData(isArabic);

  const handleExport = () => {
    toast({
      title: isArabic ? "تصدير التقرير" : "Export Report",
      description: isArabic ? "تم تصدير التقرير بنجاح" : "Report exported successfully",
    });
  };

  const handleFilter = () => {
    toast({
      title: isArabic ? "تطبيق المرشحات" : "Apply Filters",
      description: isArabic ? "تم تطبيق المرشحات المحددة" : "Selected filters have been applied",
    });
  };

  const handleDateCustomize = () => {
    toast({
      title: isArabic ? "تخصيص التاريخ" : "Customize Date",
      description: isArabic ? "فتح نافذة تخصيص التاريخ" : "Opening date customization window",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? 'التقارير والتحليلات' : 'Reports & Analytics'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'تحليل الأداء وإحصائيات العمل' : 'Performance analysis and business statistics'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="week">{isArabic ? "هذا الأسبوع" : "This Week"}</option>
            <option value="month">{isArabic ? "هذا الشهر" : "This Month"}</option>
            <option value="quarter">{isArabic ? "هذا الربع" : "This Quarter"}</option>
            <option value="year">{isArabic ? "هذا العام" : "This Year"}</option>
          </select>
          
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="overview">{isArabic ? "نظرة عامة" : "Overview"}</option>
            <option value="sales">{isArabic ? "تقرير المبيعات" : "Sales Report"}</option>
            <option value="purchases">{isArabic ? "تقرير المشتريات" : "Purchases Report"}</option>
            <option value="expenses">{isArabic ? "تقرير المصروفات" : "Expenses Report"}</option>
            <option value="inventory">{isArabic ? "تقرير المخزون" : "Inventory Report"}</option>
            <option value="customers">{isArabic ? "تقرير العملاء" : "Customers Report"}</option>
          </select>
        </div>
        
        <div className={`flex gap-2 ${isRTL ? 'sm:me-auto flex-row-reverse' : 'sm:ms-auto'}`}>
          <Button variant="outline" size="sm" onClick={handleFilter}>
            <Filter className={`w-4 h-4 ${isRTL ? 'ms-1' : 'me-1'}`} />
            {isArabic ? "تصفية" : "Filter"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDateCustomize}>
            <Calendar className={`w-4 h-4 ${isRTL ? 'ms-1' : 'me-1'}`} />
            {isArabic ? "تخصيص التاريخ" : "Customize Date"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className={`w-4 h-4 ${isRTL ? 'ms-1' : 'me-1'}`} />
            {isArabic ? "تصدير" : "Export"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards kpiData={kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "المبيعات والأرباح الشهرية" : "Monthly Sales & Profits"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name={isArabic ? "المبيعات" : "Sales"} />
                <Bar dataKey="profit" fill="#82ca9d" name={isArabic ? "الربح" : "Profit"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Categories */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "توزيع المبيعات حسب الفئة" : "Sales Distribution by Category"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "أفضل المنتجات مبيعاً" : "Top Selling Products"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductsData.map((product, index) => (
                <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} {isArabic ? "قطعة" : "units"}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-start' : 'text-end'}>
                    <p className="font-semibold">
                      {product.revenue.toLocaleString()} {isArabic ? "ر.س" : "SAR"}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expenses Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "تحليل المصروفات" : "Expenses Analysis"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseData.map((expense, index) => (
                <div key={index} className="space-y-2">
                  <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-medium">{expense.category}</span>
                    <span className="text-sm font-semibold">
                      {expense.amount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{isArabic ? "ملخص الأداء" : "Performance Summary"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">68%</div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? "معدل هامش الربح" : "Profit Margin Rate"}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? "متوسط قيمة الطلب" : "Average Order Value"}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? "متوسط التقييم" : "Average Rating"}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? "رضا العملاء" : "Customer Satisfaction"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
