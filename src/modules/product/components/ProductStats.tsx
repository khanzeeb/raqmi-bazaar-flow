// Product Stats Component

import { Card, CardContent } from '@/components/ui/card';
import { Package, Loader2 } from 'lucide-react';
import { ProductStats as Stats } from '../types';

interface ProductStatsProps {
  stats: Stats;
  loading: boolean;
  isArabic?: boolean;
}

interface StatCardProps {
  label: string;
  value: number;
  loading: boolean;
  colorClass: string;
}

const StatCard = ({ label, value, loading, colorClass }: StatCardProps) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 ${colorClass}/10 rounded-lg flex items-center justify-center`}>
          <Package className={`h-4 w-4 ${colorClass}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ProductStatsCards = ({ stats, loading, isArabic = false }: ProductStatsProps) => {
  const items = [
    {
      label: isArabic ? 'إجمالي المنتجات' : 'Total Products',
      value: stats.total,
      colorClass: 'bg-primary text-primary',
    },
    {
      label: isArabic ? 'متوفر' : 'In Stock',
      value: stats.inStock,
      colorClass: 'bg-success text-success',
    },
    {
      label: isArabic ? 'مخزون منخفض' : 'Low Stock',
      value: stats.lowStock,
      colorClass: 'bg-warning text-warning',
    },
    {
      label: isArabic ? 'نفد المخزون' : 'Out of Stock',
      value: stats.outOfStock,
      colorClass: 'bg-destructive text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <StatCard key={index} {...item} loading={loading} />
      ))}
    </div>
  );
};
