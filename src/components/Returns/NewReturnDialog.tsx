import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { Return } from "@/types/return.types";

interface NewReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (returnData: Omit<Return, 'id'>) => void;
  isArabic: boolean;
}

export const NewReturnDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isArabic
}: NewReturnDialogProps) => {
  const [formData, setFormData] = useState({
    sale_number: '',
    customer_name: '',
    return_type: 'partial' as 'full' | 'partial',
    reason: 'defective' as Return['reason'],
    total_amount: 0,
    notes: ''
  });

  const handleSubmit = () => {
    const returnNumber = `RET-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-4)}`;
    
    onSubmit({
      return_number: returnNumber,
      sale_number: formData.sale_number,
      customer_name: formData.customer_name,
      return_date: new Date().toISOString().split('T')[0],
      return_type: formData.return_type,
      reason: formData.reason,
      total_amount: formData.total_amount,
      refund_amount: 0,
      status: 'pending',
      refund_status: 'pending'
    });

    // Reset form
    setFormData({
      sale_number: '',
      customer_name: '',
      return_type: 'partial',
      reason: 'defective',
      total_amount: 0,
      notes: ''
    });
    onOpenChange(false);
  };

  const isValid = formData.sale_number && formData.customer_name && formData.total_amount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {isArabic ? "طلب مرتجع جديد" : "New Return Request"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isArabic ? "رقم الطلب الأصلي" : "Original Order #"}</Label>
              <Input
                placeholder={isArabic ? "SALE-XXXXXX-XXXX" : "SALE-XXXXXX-XXXX"}
                value={formData.sale_number}
                onChange={(e) => setFormData({ ...formData, sale_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? "اسم العميل" : "Customer Name"}</Label>
              <Input
                placeholder={isArabic ? "اسم العميل" : "Customer name"}
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isArabic ? "نوع المرتجع" : "Return Type"}</Label>
              <Select 
                value={formData.return_type} 
                onValueChange={(value: 'full' | 'partial') => setFormData({ ...formData, return_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partial">{isArabic ? "جزئي" : "Partial"}</SelectItem>
                  <SelectItem value="full">{isArabic ? "كامل" : "Full"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? "سبب المرتجع" : "Return Reason"}</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value: Return['reason']) => setFormData({ ...formData, reason: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">{isArabic ? "معيب" : "Defective"}</SelectItem>
                  <SelectItem value="wrong_item">{isArabic ? "منتج خاطئ" : "Wrong Item"}</SelectItem>
                  <SelectItem value="not_needed">{isArabic ? "غير مطلوب" : "Not Needed"}</SelectItem>
                  <SelectItem value="damaged">{isArabic ? "تالف" : "Damaged"}</SelectItem>
                  <SelectItem value="other">{isArabic ? "أخرى" : "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "المبلغ" : "Amount"}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.total_amount || ''}
              onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>{isArabic ? "ملاحظات" : "Notes"}</Label>
            <Textarea
              placeholder={isArabic ? "ملاحظات إضافية..." : "Additional notes..."}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={!isValid} className="flex-1">
              {isArabic ? "إنشاء طلب المرتجع" : "Create Return Request"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
