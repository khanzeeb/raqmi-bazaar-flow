// Product View Dialog Component

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ProductView } from '../types';
import { useUserSettings } from '@/contexts/UserSettingsContext';

interface ProductViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductView | null;
  isArabic?: boolean;
}

const getStockBadge = (stock: number, isArabic: boolean) => {
  if (stock === 0) {
    return <Badge variant="destructive">{isArabic ? 'نفد المخزون' : 'Out of Stock'}</Badge>;
  }
  if (stock < 10) {
    return <Badge variant="secondary" className="bg-warning/10 text-warning">{isArabic ? 'مخزون منخفض' : 'Low Stock'}</Badge>;
  }
  return <Badge variant="secondary" className="bg-success/10 text-success">{isArabic ? 'متوفر' : 'In Stock'}</Badge>;
};

export const ProductViewDialog = ({
  open,
  onOpenChange,
  product,
  isArabic = false,
}: ProductViewDialogProps) => {
  const { formatCurrency } = useUserSettings();

  if (!product) return null;

  const fields = [
    { label: isArabic ? 'اسم المنتج' : 'Product Name', value: isArabic ? product.nameAr : product.name },
    { label: isArabic ? 'رمز المنتج' : 'SKU', value: product.sku, mono: true },
    { label: isArabic ? 'الفئة' : 'Category', value: product.category },
    { label: isArabic ? 'السعر' : 'Price', value: formatCurrency(product.price) },
    { label: isArabic ? 'الحالة' : 'Status', value: product.status, capitalize: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isArabic ? 'تفاصيل المنتج' : 'Product Details'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <div key={index}>
                <label className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </label>
                <p className={`text-sm ${field.mono ? 'font-mono' : ''} ${field.capitalize ? 'capitalize' : ''}`}>
                  {field.value}
                </p>
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'المخزون' : 'Stock'}
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm">{product.stock}</p>
                {getStockBadge(product.stock, isArabic)}
              </div>
            </div>

            {product.barcode && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'الرمز الشريطي' : 'Barcode'}
                </label>
                <p className="text-sm font-mono">{product.barcode}</p>
              </div>
            )}
          </div>

          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'المتغيرات' : 'Variants'}
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.variants.map((variant, index) => (
                  <Badge key={index} variant="outline">{variant}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
