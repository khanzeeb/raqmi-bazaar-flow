// Product Table Component

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ProductView } from '../types';
import { useUserSettings } from '@/contexts/UserSettingsContext';

interface ProductTableProps {
  products: ProductView[];
  isArabic?: boolean;
  onView: (id: string) => void;
  onEdit: (product: ProductView) => void;
  onDelete: (id: string) => void;
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

export const ProductTable = ({
  products,
  isArabic = false,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) => {
  const { formatCurrency } = useUserSettings();

  const headers = [
    isArabic ? 'المنتج' : 'Product',
    isArabic ? 'رمز المنتج' : 'SKU',
    isArabic ? 'الفئة' : 'Category',
    isArabic ? 'السعر' : 'Price',
    isArabic ? 'المخزون' : 'Stock',
    isArabic ? 'الحالة' : 'Status',
    isArabic ? 'الإجراءات' : 'Actions',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isArabic ? 'قائمة المنتجات' : 'Products List'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, i) => (
                <TableHead key={i}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{isArabic ? product.nameAr : product.name}</p>
                    {product.variants && product.variants.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {product.variants.join(', ')}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{getStockBadge(product.stock, isArabic)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(product.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
