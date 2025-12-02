// Product Empty State Component (Single Responsibility)

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Loader2 } from 'lucide-react';

interface ProductEmptyStateProps {
  onAdd: () => void;
  isArabic?: boolean;
}

export const ProductEmptyState = ({ onAdd, isArabic = false }: ProductEmptyStateProps) => (
  <Card>
    <CardContent className="p-8">
      <div className="text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium">
          {isArabic ? 'لا توجد منتجات' : 'No products found'}
        </p>
        <p className="text-muted-foreground mb-4">
          {isArabic ? 'ابدأ بإضافة منتجك الأول' : 'Get started by adding your first product'}
        </p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'منتج جديد' : 'Add Product'}
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface ProductLoadingStateProps {
  isArabic?: boolean;
}

export const ProductLoadingState = ({ isArabic = false }: ProductLoadingStateProps) => (
  <Card>
    <CardContent className="p-8">
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>{isArabic ? 'جاري تحميل المنتجات...' : 'Loading products...'}</span>
      </div>
    </CardContent>
  </Card>
);

interface ProductErrorStateProps {
  error: string;
  isArabic?: boolean;
}

export const ProductErrorState = ({ error, isArabic = false }: ProductErrorStateProps) => (
  <Card>
    <CardContent className="p-8">
      <div className="text-center text-destructive">
        <p>{isArabic ? 'خطأ في تحميل المنتجات' : 'Error loading products'}</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    </CardContent>
  </Card>
);
