import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryItem } from "@/pages/Inventory";

interface InventoryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
}

export const InventoryEditDialog = ({ open, onOpenChange, item, onSave }: InventoryEditDialogProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [formData, setFormData] = useState<InventoryItem | null>(item);

  React.useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            {isArabic ? 'تعديل المنتج' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isArabic ? 'اسم المنتج' : 'Product Name'}</Label>
              <Input
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{isArabic ? 'رمز المنتج' : 'SKU'}</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? 'الفئة' : 'Category'}</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="Electronics">{isArabic ? 'إلكترونيات' : 'Electronics'}</option>
                <option value="Printers">{isArabic ? 'طابعات' : 'Printers'}</option>
                <option value="Monitors">{isArabic ? 'شاشات' : 'Monitors'}</option>
                <option value="Accessories">{isArabic ? 'إكسسوارات' : 'Accessories'}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? 'المورد' : 'Supplier'}</Label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? 'الحد الأدنى للمخزون' : 'Minimum Stock'}</Label>
              <Input
                type="number"
                value={formData.minimumStock}
                onChange={(e) => setFormData({...formData, minimumStock: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? 'الحد الأقصى للمخزون' : 'Maximum Stock'}</Label>
              <Input
                type="number"
                value={formData.maximumStock}
                onChange={(e) => setFormData({...formData, maximumStock: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? 'سعر التكلفة' : 'Unit Cost'}</Label>
              <Input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({...formData, unitCost: parseFloat(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? 'سعر البيع' : 'Unit Price'}</Label>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? 'الموقع' : 'Location'}</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? 'ملاحظات' : 'Notes'}</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave}>
              {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};