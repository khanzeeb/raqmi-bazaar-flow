export interface SalesData {
  month: string;
  sales: number;
  purchases: number;
  profit: number;
}

export interface ProductCategoryData {
  name: string;
  value: number;
  color: string;
}

export interface TopProductData {
  name: string;
  sales: number;
  revenue: number;
}

export interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
}

export interface KPIData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

export interface ReportFilters {
  selectedPeriod: string;
  selectedReport: string;
}
