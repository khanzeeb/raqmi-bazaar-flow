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
import { ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryItem } from "@/pages/Inventory";

interface ReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onReorder: (itemId: string, quantity: number, notes: string) => void;
}

export const ReorderDialog = ({ open, onOpenChange, item, onReorder }: ReorderDialogProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (item && open) {
      // Suggest reorder quantity: minimum stock * 2 to maintain buffer
      const suggestedQuantity = (item.maximumStock - item.currentStock);
      setQuantity(suggestedQuantity);
    }
  }, [item, open]);

  const handleReorder = () => {
    if (item && quantity > 0) {
      onReorder(item.id, quantity, notes);
      onOpenChange(false);
      setQuantity(0);
      setNotes('');
    }
  };

  if (!item) return null;

  const totalCost = quantity * item.unitCost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {isArabic ? 'طلب توريد' : 'Reorder Product'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium">{item.productName}</h3>
            <div className="text-sm text-muted-foreground space-y-1 mt-2">
              <p>{isArabic ? 'المخزون الحالي:' : 'Current Stock:'} {item.currentStock}</p>
              <p>{isArabic ? 'الحد الأدنى:' : 'Minimum Stock:'} {item.minimumStock}</p>
              <p>{isArabic ? 'الحد الأقصى:' : 'Maximum Stock:'} {item.maximumStock}</p>
              <p>{isArabic ? 'المورد:' : 'Supplier:'} {item.supplier}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? 'كمية الطلب' : 'Order Quantity'}</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'المخزون بعد الطلب:' : 'Stock after order:'} {item.currentStock + quantity}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? 'ملاحظات الطلب' : 'Order Notes'}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isArabic ? 'ملاحظات إضافية للطلب...' : 'Additional notes for the order...'}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>{isArabic ? 'سعر الوحدة:' : 'Unit Cost:'}</span>
              <span>{item.unitCost.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{isArabic ? 'الكمية:' : 'Quantity:'}</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>{isArabic ? 'إجمالي التكلفة:' : 'Total Cost:'}</span>
              <span>{totalCost.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleReorder} disabled={quantity <= 0}>
              {isArabic ? 'إرسال الطلب' : 'Submit Order'}
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