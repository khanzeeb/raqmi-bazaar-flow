import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Smartphone, Building } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/pages/Invoices";

interface InvoicePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const InvoicePaymentDialog: React.FC<InvoicePaymentDialogProps> = ({
  open,
  onOpenChange,
  invoice
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const [paymentData, setPaymentData] = useState({
    amount: invoice?.total || 0,
    method: 'cash' as 'cash' | 'bank_transfer' | 'credit_card' | 'digital_wallet',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  React.useEffect(() => {
    if (invoice) {
      setPaymentData(prev => ({ ...prev, amount: invoice.total }));
    }
  }, [invoice]);

  if (!invoice) return null;

  const paymentMethods = [
    { value: 'cash', label: isArabic ? 'نقدي' : 'Cash', icon: Banknote },
    { value: 'bank_transfer', label: isArabic ? 'تحويل بنكي' : 'Bank Transfer', icon: Building },
    { value: 'credit_card', label: isArabic ? 'بطاقة ائتمان' : 'Credit Card', icon: CreditCard },
    { value: 'digital_wallet', label: isArabic ? 'محفظة رقمية' : 'Digital Wallet', icon: Smartphone }
  ];

  const selectedMethod = paymentMethods.find(m => m.value === paymentData.method);

  const handleSavePayment = () => {
    if (paymentData.amount <= 0) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "يرجى إدخال مبلغ صحيح" : "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (paymentData.amount > invoice.total) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "المبلغ أكبر من قيمة الفاتورة" : "Amount exceeds invoice total",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isArabic ? "تم تسجيل الدفعة" : "Payment Recorded",
      description: isArabic 
        ? `تم تسجيل دفعة بقيمة ${paymentData.amount.toLocaleString()} ر.س للفاتورة ${invoice.invoiceNumber}`
        : `Payment of ${paymentData.amount.toLocaleString()} SAR recorded for invoice ${invoice.invoiceNumber}`,
    });
    onOpenChange(false);
  };

  const remainingAmount = invoice.total - paymentData.amount;
  const isFullPayment = paymentData.amount === invoice.total;
  const isPartialPayment = paymentData.amount > 0 && paymentData.amount < invoice.total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {isArabic ? 'تسجيل دفعة' : 'Record Payment'}: {invoice.invoiceNumber}
          </DialogTitle>
          <DialogDescription>
            {isArabic ? 'تسجيل دفعة جديدة للفاتورة' : 'Record a new payment for this invoice'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{isArabic ? 'ملخص الفاتورة' : 'Invoice Summary'}</h3>
                  <p className="text-sm text-muted-foreground">{invoice.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{invoice.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                  <p className="text-sm text-muted-foreground">{isArabic ? 'إجمالي الفاتورة' : 'Invoice Total'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <Label className="text-base font-medium">{isArabic ? 'تفاصيل الدفعة' : 'Payment Details'}</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">{isArabic ? 'المبلغ المدفوع' : 'Payment Amount'} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    step="0.01"
                    min="0"
                    max={invoice.total}
                  />
                </div>

                <div>
                  <Label htmlFor="date">{isArabic ? 'تاريخ الدفع' : 'Payment Date'} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>{isArabic ? 'طريقة الدفع' : 'Payment Method'} *</Label>
                <Select value={paymentData.method} onValueChange={(value) => setPaymentData(prev => ({ ...prev, method: value as any }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <method.icon className="w-4 h-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reference">{isArabic ? 'رقم المرجع/الشيك' : 'Reference/Check Number'}</Label>
                <Input
                  id="reference"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder={isArabic ? "رقم التحويل أو الشيك (اختياري)" : "Transfer or check number (optional)"}
                />
              </div>

              <div>
                <Label htmlFor="notes">{isArabic ? 'ملاحظات' : 'Notes'}</Label>
                <Textarea
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={isArabic ? "ملاحظات إضافية..." : "Additional notes..."}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{isArabic ? 'المبلغ المدفوع:' : 'Payment Amount:'}</span>
                  <span className="font-bold text-green-600">{paymentData.amount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>{isArabic ? 'المبلغ المتبقي:' : 'Remaining Amount:'}</span>
                  <span className={remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}>
                    {remainingAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>{isArabic ? 'حالة الدفع:' : 'Payment Status:'}</span>
                  <Badge className={
                    isFullPayment ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                    isPartialPayment ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' :
                    'bg-red-500/10 text-red-700 border-red-500/20'
                  }>
                    {isFullPayment ? (isArabic ? 'دفع كامل' : 'Fully Paid') :
                     isPartialPayment ? (isArabic ? 'دفع جزئي' : 'Partially Paid') :
                     (isArabic ? 'غير مدفوع' : 'Unpaid')}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>{isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                  <div className="flex items-center gap-2">
                    {selectedMethod && <selectedMethod.icon className="w-4 h-4" />}
                    {selectedMethod?.label}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSavePayment} className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            {isArabic ? 'تسجيل الدفعة' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};