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
import { Upload, Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryItem } from "@/pages/Inventory";

interface StockUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onUpdate: (itemId: string, newStock: number, updateType: 'add' | 'remove' | 'set', reason: string) => void;
}

export const StockUpdateDialog = ({ open, onOpenChange, item, onUpdate }: StockUpdateDialogProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [updateType, setUpdateType] = useState<'add' | 'remove' | 'set'>('add');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');

  const handleUpdate = () => {
    if (item && quantity > 0) {
      onUpdate(item.id, quantity, updateType, reason);
      onOpenChange(false);
      setQuantity(0);
      setReason('');
    }
  };

  if (!item) return null;

  const getNewStock = () => {
    switch (updateType) {
      case 'add': return item.currentStock + quantity;
      case 'remove': return Math.max(0, item.currentStock - quantity);
      case 'set': return quantity;
      default: return item.currentStock;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {isArabic ? 'تحديث المخزون' : 'Update Stock'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium">{item.productName}</h3>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'المخزون الحالي:' : 'Current Stock:'} {item.currentStock}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? 'نوع التحديث' : 'Update Type'}</Label>
            <div className="flex gap-2">
              <Button
                variant={updateType === 'add' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUpdateType('add')}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isArabic ? 'إضافة' : 'Add'}
              </Button>
              <Button
                variant={updateType === 'remove' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUpdateType('remove')}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-1" />
                {isArabic ? 'سحب' : 'Remove'}
              </Button>
              <Button
                variant={updateType === 'set' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUpdateType('set')}
                className="flex-1"
              >
                {isArabic ? 'تعيين' : 'Set'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {updateType === 'set' 
                ? (isArabic ? 'المخزون الجديد' : 'New Stock Amount')
                : (isArabic ? 'الكمية' : 'Quantity')}
            </Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? 'السبب' : 'Reason'}</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isArabic ? 'سبب التحديث...' : 'Reason for update...'}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">
                {isArabic ? 'المخزون بعد التحديث:' : 'Stock after update:'}
              </span>{' '}
              {getNewStock()}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpdate} disabled={quantity <= 0 || !reason.trim()}>
              {isArabic ? 'تحديث المخزون' : 'Update Stock'}
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