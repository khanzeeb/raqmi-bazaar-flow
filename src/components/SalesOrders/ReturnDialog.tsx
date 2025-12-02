import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Package, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { SalesOrder } from "@/types/salesOrder.types";

interface ReturnDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: SalesOrder | null;
}

interface ReturnItem {
  saleItemId: string;
  productId: string;
  productName: string;
  originalQuantity: number;
  quantityReturned: number;
  unitPrice: number;
  condition: 'good' | 'damaged' | 'defective' | 'unopened';
  notes?: string;
}

const conditionOptions = [
  { value: 'good', label: 'Good', labelAr: 'جيد' },
  { value: 'damaged', label: 'Damaged', labelAr: 'تالف' },
  { value: 'defective', label: 'Defective', labelAr: 'معيب' },
  { value: 'unopened', label: 'Unopened', labelAr: 'غير مفتوح' }
];

const reasonOptions = [
  { value: 'defective', label: 'Defective Product', labelAr: 'منتج معيب' },
  { value: 'wrong_item', label: 'Wrong Item', labelAr: 'منتج خاطئ' },
  { value: 'not_needed', label: 'Not Needed', labelAr: 'غير مطلوب' },
  { value: 'damaged', label: 'Damaged in Transit', labelAr: 'تالف أثناء الشحن' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' }
];

export function ReturnDialog({ isOpen, onOpenChange, order }: ReturnDialogProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const [returnType, setReturnType] = useState<'full' | 'partial'>('partial');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  // Initialize return items when order changes
  React.useEffect(() => {
    if (order?.items) {
      setReturnItems(order.items.map(item => ({
        saleItemId: item.id,
        productId: item.id,
        productName: item.name,
        originalQuantity: item.quantity,
        quantityReturned: 0,
        unitPrice: item.price,
        condition: 'good' as const,
        notes: ''
      })));
    }
  }, [order]);

  const handleItemReturnChange = (itemId: string, field: keyof ReturnItem, value: any) => {
    setReturnItems(prev => prev.map(item => 
      item.saleItemId === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSelectAllItems = () => {
    if (returnType === 'full') {
      setReturnItems(prev => prev.map(item => ({
        ...item,
        quantityReturned: item.originalQuantity
      })));
    }
  };

  const getReturnTotal = () => {
    return returnItems.reduce((sum, item) => {
      return sum + (item.quantityReturned * item.unitPrice);
    }, 0);
  };

  const getSelectedItemsCount = () => {
    return returnItems.filter(item => item.quantityReturned > 0).length;
  };

  const handleSubmitReturn = () => {
    const selectedItems = returnItems.filter(item => item.quantityReturned > 0);
    
    if (selectedItems.length === 0) {
      toast({
        variant: "destructive",
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "يجب اختيار عنصر واحد على الأقل للإرجاع" : "Please select at least one item to return"
      });
      return;
    }

    if (!reason) {
      toast({
        variant: "destructive",
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "يجب اختيار سبب الإرجاع" : "Please select a return reason"
      });
      return;
    }

    // Here you would call the API to create the return
    const returnData = {
      sale_id: order?.id,
      return_date: new Date().toISOString().split('T')[0],
      return_type: returnType,
      reason: reason,
      notes: notes,
      items: selectedItems.map(item => ({
        sale_item_id: item.saleItemId,
        quantity_returned: item.quantityReturned,
        condition: item.condition,
        notes: item.notes
      }))
    };

    console.log('Creating return:', returnData);

    toast({
      title: isArabic ? "تم إنشاء طلب الإرجاع" : "Return Request Created",
      description: isArabic ? 
        `تم إنشاء طلب إرجاع ${selectedItems.length} عنصر بقيمة ${getReturnTotal().toFixed(2)} ريال` :
        `Return request created for ${selectedItems.length} items worth $${getReturnTotal().toFixed(2)}`
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {isArabic ? "إرجاع طلب" : "Return Order"} - {order?.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {isArabic ? "معلومات الطلب" : "Order Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {isArabic ? "رقم الطلب" : "Order Number"}
                  </Label>
                  <p className="font-medium">{order?.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {isArabic ? "العميل" : "Customer"}
                  </Label>
                  <p className="font-medium">{order?.customer.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {isArabic ? "إجمالي الطلب" : "Order Total"}
                  </Label>
                  <p className="font-medium">${order?.total.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {isArabic ? "حالة الطلب" : "Order Status"}
                  </Label>
                  <Badge className="bg-green-100 text-green-800">
                    {isArabic ? "مكتمل" : "Completed"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {isArabic ? "نوع الإرجاع" : "Return Type"}
            </Label>
            <div className="flex gap-4">
              <Button
                variant={returnType === 'partial' ? 'default' : 'outline'}
                onClick={() => setReturnType('partial')}
                className="flex-1"
              >
                {isArabic ? "إرجاع جزئي" : "Partial Return"}
              </Button>
              <Button
                variant={returnType === 'full' ? 'default' : 'outline'}
                onClick={() => {
                  setReturnType('full');
                  handleSelectAllItems();
                }}
                className="flex-1"
              >
                {isArabic ? "إرجاع كامل" : "Full Return"}
              </Button>
            </div>
          </div>

          {/* Return Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              {isArabic ? "سبب الإرجاع" : "Return Reason"} *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? "اختر سبب الإرجاع" : "Select return reason"} />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {isArabic ? option.labelAr : option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items to Return */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {isArabic ? "العناصر المراد إرجاعها" : "Items to Return"}
              </Label>
              {getSelectedItemsCount() > 0 && (
                <Badge variant="secondary">
                  {getSelectedItemsCount()} {isArabic ? "عنصر محدد" : "items selected"}
                </Badge>
              )}
            </div>

            <div className="space-y-3 border rounded-lg p-4 max-h-64 overflow-y-auto">
              {returnItems.map((item) => (
                <Card key={item.saleItemId} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {isArabic ? "الكمية الأصلية" : "Original qty"}: {item.originalQuantity} • 
                            {isArabic ? "السعر" : "Price"}: ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">
                          {isArabic ? "كمية الإرجاع" : "Return Qty"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max={item.originalQuantity}
                          value={item.quantityReturned}
                          onChange={(e) => handleItemReturnChange(
                            item.saleItemId, 
                            'quantityReturned', 
                            Math.min(parseInt(e.target.value) || 0, item.originalQuantity)
                          )}
                          className="h-8"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">
                          {isArabic ? "الحالة" : "Condition"}
                        </Label>
                        <Select 
                          value={item.condition} 
                          onValueChange={(value) => handleItemReturnChange(item.saleItemId, 'condition', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {isArabic ? option.labelAr : option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">
                          {isArabic ? "المبلغ" : "Amount"}
                        </Label>
                        <div className="h-8 px-3 py-1 bg-muted rounded-md flex items-center text-sm">
                          ${(item.quantityReturned * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {item.quantityReturned > 0 && (
                      <div>
                        <Label className="text-xs">
                          {isArabic ? "ملاحظات" : "Notes"}
                        </Label>
                        <Input
                          placeholder={isArabic ? "ملاحظات إضافية..." : "Additional notes..."}
                          value={item.notes}
                          onChange={(e) => handleItemReturnChange(item.saleItemId, 'notes', e.target.value)}
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Return Summary */}
          {getSelectedItemsCount() > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {isArabic ? "إجمالي المبلغ المسترد" : "Total Return Amount"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getSelectedItemsCount()} {isArabic ? "عنصر" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${getReturnTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              {isArabic ? "ملاحظات إضافية" : "Additional Notes"}
            </Label>
            <Textarea
              id="notes"
              placeholder={isArabic ? "أضف ملاحظات حول طلب الإرجاع..." : "Add notes about the return request..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmitReturn} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              {isArabic ? "إرسال طلب الإرجاع" : "Submit Return Request"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}