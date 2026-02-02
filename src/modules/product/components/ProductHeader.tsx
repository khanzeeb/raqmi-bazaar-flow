// Product Header Component

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Package, Plus, Upload, Download } from 'lucide-react';

interface ProductHeaderProps {
  onAdd: () => void;
  onExport: () => void;
  loading?: boolean;
  isArabic?: boolean;
}

export const ProductHeader = ({
  onAdd,
  onExport,
  loading = false,
  isArabic = false,
}: ProductHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {isArabic ? 'إدارة المنتجات' : 'Product Management'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إضافة وتحرير وإدارة منتجات المتجر' : 'Add, edit and manage store products'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              {isArabic ? 'استيراد' : 'Import'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Upload className="h-4 w-4 mr-2" />
              {isArabic ? 'استيراد من Excel' : 'Import from Excel'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Upload className="h-4 w-4 mr-2" />
              {isArabic ? 'استيراد من CSV' : 'Import from CSV'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          {isArabic ? 'تصدير' : 'Export'}
        </Button>

        <Button onClick={onAdd} size="sm" disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'منتج جديد' : 'Add Product'}
        </Button>
      </div>
    </div>
  );
};
