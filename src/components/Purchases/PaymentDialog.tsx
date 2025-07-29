import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: {
    id: string;
    purchaseNumber: string;
    supplier: { name: string };
    total: number;
    paidAmount: number;
    remainingAmount: number;
  };
  onSave: (paymentData: {
    amount: number;
    date: string;
    method: 'cash' | 'bank_transfer' | 'check';
    reference?: string;
    notes?: string;
  }) => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  purchase,
  onSave,
}: PaymentDialogProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'cash' as 'cash' | 'bank_transfer' | 'check',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    if (purchase && open) {
      setFormData({
        amount: purchase.remainingAmount,
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        reference: '',
        notes: ''
      });
    }
  }, [purchase, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "يجب إدخال مبلغ صحيح" : "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (purchase && formData.amount > purchase.remainingAmount) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "المبلغ يتجاوز المبلغ المطلوب" : "Amount exceeds remaining amount",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      check: { ar: 'شيك', en: 'Check' }
    };
    return methodMap[method as keyof typeof methodMap]?.[isArabic ? 'ar' : 'en'] || method;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'إضافة دفعة للمشتريات' : 'Add Purchase Payment'}
          </DialogTitle>
        </DialogHeader>

        {purchase && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="font-medium">{purchase.purchaseNumber}</p>
            <p className="text-sm text-muted-foreground">{purchase.supplier.name}</p>
            <div className="flex justify-between mt-2">
              <span className="text-sm">{isArabic ? 'المجموع:' : 'Total:'}</span>
              <span>{purchase.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{isArabic ? 'المدفوع:' : 'Paid:'}</span>
              <span>{purchase.paidAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-sm">{isArabic ? 'المتبقي:' : 'Remaining:'}</span>
              <span className="text-green-600">{purchase.remainingAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">{isArabic ? 'مبلغ الدفعة' : 'Payment Amount'}</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">{isArabic ? 'تاريخ الدفعة' : 'Payment Date'}</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</Label>
              <Select
                value={formData.method}
                onValueChange={(value: any) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{getPaymentMethodText('cash')}</SelectItem>
                  <SelectItem value="bank_transfer">{getPaymentMethodText('bank_transfer')}</SelectItem>
                  <SelectItem value="check">{getPaymentMethodText('check')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reference">{isArabic ? 'المرجع' : 'Reference'}</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder={isArabic ? 'رقم المرجع' : 'Reference number'}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{isArabic ? 'ملاحظات' : 'Notes'}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit">
              {isArabic ? 'حفظ الدفعة' : 'Save Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}