// Product Filters Component

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, List, Grid3x3 } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  stockFilter: string;
  onStockChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isArabic?: boolean;
}

export const ProductFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  stockFilter,
  onStockChange,
  viewMode,
  onViewModeChange,
  isArabic = false,
}: ProductFiltersProps) => {
  const statusOptions = [
    { value: 'all', label: isArabic ? 'كل الحالات' : 'All Status' },
    { value: 'active', label: isArabic ? 'نشط' : 'Active' },
    { value: 'inactive', label: isArabic ? 'غير نشط' : 'Inactive' },
  ];

  const stockOptions = [
    { value: 'all', label: isArabic ? 'كل المخزون' : 'All Stock' },
    { value: 'in-stock', label: isArabic ? 'متوفر' : 'In Stock' },
    { value: 'low-stock', label: isArabic ? 'مخزون منخفض' : 'Low Stock' },
    { value: 'out-of-stock', label: isArabic ? 'نفد المخزون' : 'Out of Stock' },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={isArabic ? 'البحث في المنتجات...' : 'Search products...'}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={onStockChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={isArabic ? 'المخزون' : 'Stock'} />
              </SelectTrigger>
              <SelectContent>
                {stockOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-l-none"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
