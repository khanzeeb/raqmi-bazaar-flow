import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, AlertTriangle, Archive, BarChart3 } from "lucide-react";
import { InventoryItem } from "@/types/inventory.types";

interface InventoryCardProps {
  item: InventoryItem;
  isArabic: boolean;
  onEdit: (item: InventoryItem) => void;
  onUpdateStock: (item: InventoryItem) => void;
  onReorder: (item: InventoryItem) => void;
  onViewReport: (item: InventoryItem) => void;
}

export const InventoryCard = ({
  item,
  isArabic,
  onEdit,
  onUpdateStock,
  onReorder,
  onViewReport
}: InventoryCardProps) => {
  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'low_stock': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'out_of_stock': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'discontinued': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: InventoryItem['status']) => {
    if (isArabic) {
      switch (status) {
        case 'in_stock': return 'متوفر';
        case 'low_stock': return 'مخزون قليل';
        case 'out_of_stock': return 'نفد المخزون';
        case 'discontinued': return 'متوقف';
        default: return status;
      }
    } else {
      switch (status) {
        case 'in_stock': return 'In Stock';
        case 'low_stock': return 'Low Stock';
        case 'out_of_stock': return 'Out of Stock';
        case 'discontinued': return 'Discontinued';
        default: return status;
      }
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return <Package className="w-4 h-4" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out_of_stock': return <Archive className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {item.productName}
              {getStatusIcon(item.status)}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? 'الرمز:' : 'SKU:'} {item.sku} | {isArabic ? 'الفئة:' : 'Category:'} {item.category}
            </p>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'المورد:' : 'Supplier:'} {item.supplier}
            </p>
          </div>
          <Badge className={getStatusColor(item.status)}>
            {getStatusText(item.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'المخزون الحالي' : 'Current Stock'}</p>
            <p className="font-semibold text-lg">{item.currentStock}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'الحد الأدنى' : 'Min Stock'}</p>
            <p className="font-medium">{item.minimumStock}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'سعر التكلفة' : 'Unit Cost'}</p>
            <p className="font-medium">{item.unitCost.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'سعر البيع' : 'Unit Price'}</p>
            <p className="font-medium">{item.unitPrice.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'الموقع' : 'Location'}</p>
            <p className="font-medium text-sm">{item.location}</p>
          </div>
        </div>
        
        <div className="flex gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Edit className="w-4 h-4 mr-1" />
            {isArabic ? 'تعديل' : 'Edit'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onUpdateStock(item)}>
            {isArabic ? 'تحديث المخزون' : 'Update Stock'}
          </Button>
          {item.currentStock <= item.minimumStock && (
            <Button variant="outline" size="sm" onClick={() => onReorder(item)}>
              {isArabic ? 'إعادة طلب' : 'Reorder'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onViewReport(item)}>
            <BarChart3 className="w-4 h-4 mr-1" />
            {isArabic ? 'تقرير' : 'Report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
