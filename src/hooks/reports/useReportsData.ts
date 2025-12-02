import { useState } from 'react';
import { SalesData, ProductCategoryData, TopProductData, ExpenseData, KPIData, ReportFilters } from '@/types/report.types';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

export const useReportsData = (isArabic: boolean) => {
  const [filters, setFilters] = useState<ReportFilters>({
    selectedPeriod: 'month',
    selectedReport: 'overview'
  });

  const salesData: SalesData[] = [
    { month: isArabic ? 'يناير' : 'Jan', sales: 45000, purchases: 25000, profit: 20000 },
    { month: isArabic ? 'فبراير' : 'Feb', sales: 52000, purchases: 28000, profit: 24000 },
    { month: isArabic ? 'مارس' : 'Mar', sales: 48000, purchases: 26000, profit: 22000 },
    { month: isArabic ? 'أبريل' : 'Apr', sales: 61000, purchases: 32000, profit: 29000 },
    { month: isArabic ? 'مايو' : 'May', sales: 55000, purchases: 30000, profit: 25000 },
    { month: isArabic ? 'يونيو' : 'Jun', sales: 67000, purchases: 35000, profit: 32000 }
  ];

  const productCategoryData: ProductCategoryData[] = [
    { name: isArabic ? 'إلكترونيات' : 'Electronics', value: 45, color: '#8884d8' },
    { name: isArabic ? 'إكسسوارات' : 'Accessories', value: 25, color: '#82ca9d' },
    { name: isArabic ? 'طابعات' : 'Printers', value: 20, color: '#ffc658' },
    { name: isArabic ? 'شاشات' : 'Monitors', value: 10, color: '#ff7300' }
  ];

  const topProductsData: TopProductData[] = [
    { name: isArabic ? 'جهاز كمبيوتر محمول' : 'Laptop Computer', sales: 35, revenue: 87500 },
    { name: isArabic ? 'طابعة ليزر' : 'Laser Printer', sales: 28, revenue: 22400 },
    { name: isArabic ? 'شاشة 24 بوصة' : '24-inch Monitor', sales: 22, revenue: 13200 },
    { name: isArabic ? 'ماوس لاسلكي' : 'Wireless Mouse', sales: 45, revenue: 2250 },
    { name: isArabic ? 'لوحة مفاتيح' : 'Keyboard', sales: 30, revenue: 3600 }
  ];

  const expenseData: ExpenseData[] = [
    { category: isArabic ? 'إيجار' : 'Rent', amount: 5000, percentage: 35 },
    { category: isArabic ? 'مرافق' : 'Utilities', amount: 1500, percentage: 10 },
    { category: isArabic ? 'مواصلات' : 'Transport', amount: 800, percentage: 6 },
    { category: isArabic ? 'مكتب' : 'Office', amount: 1200, percentage: 8 },
    { category: isArabic ? 'تسويق' : 'Marketing', amount: 2000, percentage: 14 },
    { category: isArabic ? 'صيانة' : 'Maintenance', amount: 900, percentage: 6 },
    { category: isArabic ? 'أخرى' : 'Other', amount: 3000, percentage: 21 }
  ];

  const kpiData: KPIData[] = [
    { title: isArabic ? 'إجمالي المبيعات' : 'Total Sales', value: isArabic ? '328,000 ر.س' : 'SAR 328,000', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-green-600' },
    { title: isArabic ? 'إجمالي الطلبات' : 'Total Orders', value: '1,247', change: '+8.2%', trend: 'up', icon: ShoppingCart, color: 'text-blue-600' },
    { title: isArabic ? 'العملاء الجدد' : 'New Customers', value: '89', change: '+15.3%', trend: 'up', icon: Users, color: 'text-purple-600' },
    { title: isArabic ? 'المنتجات المباعة' : 'Products Sold', value: '2,156', change: '-2.1%', trend: 'down', icon: Package, color: 'text-orange-600' }
  ];

  const setSelectedPeriod = (period: string) => setFilters(prev => ({ ...prev, selectedPeriod: period }));
  const setSelectedReport = (report: string) => setFilters(prev => ({ ...prev, selectedReport: report }));

  return {
    filters,
    salesData,
    productCategoryData,
    topProductsData,
    expenseData,
    kpiData,
    setSelectedPeriod,
    setSelectedReport
  };
};
