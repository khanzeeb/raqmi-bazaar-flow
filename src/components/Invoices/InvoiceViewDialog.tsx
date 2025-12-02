import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Invoice } from "@/types/invoice.types";

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const InvoiceViewDialog: React.FC<InvoiceViewDialogProps> = ({
  open,
  onOpenChange,
  invoice
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  if (!invoice) return null;

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'paid': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'overdue': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'cancelled': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    if (isArabic) {
      switch (status) {
        case 'draft': return 'مسودة';
        case 'sent': return 'مرسلة';
        case 'paid': return 'مدفوعة';
        case 'overdue': return 'متأخرة';
        case 'cancelled': return 'ملغاة';
        default: return status;
      }
    } else {
      switch (status) {
        case 'draft': return 'Draft';
        case 'sent': return 'Sent';
        case 'paid': return 'Paid';
        case 'overdue': return 'Overdue';
        case 'cancelled': return 'Cancelled';
        default: return status;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isArabic ? 'عرض الفاتورة' : 'Invoice Details'}: {invoice.invoiceNumber}</span>
            <Badge className={getStatusColor(invoice.status)}>
              {getStatusText(invoice.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {isArabic ? 'تفاصيل كاملة للفاتورة' : 'Complete invoice information and details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isArabic ? 'معلومات العميل' : 'Customer Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">{isArabic ? 'الاسم:' : 'Name:'} </span>
                {invoice.customer.name}
              </div>
              <div>
                <span className="font-medium">{isArabic ? 'الهاتف:' : 'Phone:'} </span>
                {invoice.customer.phone}
              </div>
              {invoice.customer.email && (
                <div>
                  <span className="font-medium">{isArabic ? 'البريد الإلكتروني:' : 'Email:'} </span>
                  {invoice.customer.email}
                </div>
              )}
              {invoice.customer.address && (
                <div>
                  <span className="font-medium">{isArabic ? 'العنوان:' : 'Address:'} </span>
                  {invoice.customer.address}
                </div>
              )}
              {invoice.customer.taxId && (
                <div>
                  <span className="font-medium">{isArabic ? 'الرقم الضريبي:' : 'Tax ID:'} </span>
                  {invoice.customer.taxId}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isArabic ? 'معلومات الفاتورة' : 'Invoice Information'}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{isArabic ? 'تاريخ الإصدار:' : 'Issue Date:'} </span>
                {invoice.issueDate}
              </div>
              <div>
                <span className="font-medium">{isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'} </span>
                {invoice.dueDate}
              </div>
              <div>
                <span className="font-medium">{isArabic ? 'شروط الدفع:' : 'Payment Terms:'} </span>
                {invoice.paymentTerms}
              </div>
              <div>
                <span className="font-medium">{isArabic ? 'العملة:' : 'Currency:'} </span>
                {invoice.currency}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isArabic ? 'عناصر الفاتورة' : 'Invoice Items'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {isArabic ? 'الكمية:' : 'Quantity:'} {item.quantity} × {item.unitPrice.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
                      </div>
                    </div>
                    <div className="font-bold">{item.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isArabic ? 'الملخص المالي' : 'Financial Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span>{invoice.subtotal.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
              </div>
              <div className="flex justify-between">
                <span>{isArabic ? 'الضريبة' : 'Tax'} ({invoice.taxRate}%):</span>
                <span>{invoice.taxAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
              </div>
              <div className="flex justify-between">
                <span>{isArabic ? 'الخصم:' : 'Discount:'}</span>
                <span>-{invoice.discount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                <span>{invoice.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(invoice.notes || invoice.customFields) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isArabic ? 'معلومات إضافية' : 'Additional Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoice.customFields?.poNumber && (
                  <div>
                    <span className="font-medium">{isArabic ? 'رقم أمر الشراء:' : 'PO Number:'} </span>
                    {invoice.customFields.poNumber}
                  </div>
                )}
                {invoice.customFields?.deliveryTerms && (
                  <div>
                    <span className="font-medium">{isArabic ? 'شروط التسليم:' : 'Delivery Terms:'} </span>
                    {invoice.customFields.deliveryTerms}
                  </div>
                )}
                {invoice.notes && (
                  <div>
                    <span className="font-medium">{isArabic ? 'ملاحظات:' : 'Notes:'} </span>
                    {invoice.notes}
                  </div>
                )}
                {invoice.qrCode && (
                  <div>
                    <span className="font-medium">{isArabic ? 'رمز الاستجابة:' : 'QR Code:'} </span>
                    {invoice.qrCode}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};