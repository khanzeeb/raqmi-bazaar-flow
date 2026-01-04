import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Quotation } from "@/types/quotation.types";

interface QuotationViewDialogProps {
  quotation: Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: Quotation['status']) => {
  const colors = {
    draft: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    sent: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    accepted: 'bg-green-500/10 text-green-700 border-green-500/20',
    expired: 'bg-red-500/10 text-red-700 border-red-500/20',
  };
  return colors[status] || colors.draft;
};

export const QuotationViewDialog: React.FC<QuotationViewDialogProps> = ({
  quotation,
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const statusText = {
    draft: { ar: 'مسودة', en: 'Draft' },
    sent: { ar: 'مرسل', en: 'Sent' },
    accepted: { ar: 'مقبول', en: 'Accepted' },
    expired: { ar: 'منتهي الصلاحية', en: 'Expired' },
  };

  if (!quotation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isArabic ? "تفاصيل عرض السعر" : "Quotation Details"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{quotation.quotationNumber}</h3>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "تاريخ الإنشاء:" : "Created:"} {quotation.createdAt}
              </p>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(quotation.status)}>
                {statusText[quotation.status]?.[isArabic ? 'ar' : 'en']}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {isArabic ? "صالح حتى:" : "Valid until:"} {quotation.expiryDate}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h4 className="font-medium mb-3">{isArabic ? "معلومات العميل" : "Customer Information"}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{isArabic ? "الاسم" : "Name"}</label>
                <p className="text-sm">{quotation.customer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{isArabic ? "نوع العميل" : "Customer Type"}</label>
                <p className="text-sm capitalize">
                  {quotation.customer.type === 'individual' 
                    ? (isArabic ? 'فردي' : 'Individual')
                    : (isArabic ? 'شركة' : 'Business')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{isArabic ? "الهاتف" : "Phone"}</label>
                <p className="text-sm">{quotation.customer.phone}</p>
              </div>
              {quotation.customer.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
                  <p className="text-sm">{quotation.customer.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-medium mb-3">{isArabic ? "العناصر" : "Items"}</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">{isArabic ? "المنتج" : "Product"}</th>
                    <th className="text-center p-3 text-sm font-medium">{isArabic ? "الكمية" : "Quantity"}</th>
                    <th className="text-right p-3 text-sm font-medium">{isArabic ? "السعر" : "Price"}</th>
                    <th className="text-right p-3 text-sm font-medium">{isArabic ? "المجموع" : "Total"}</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{item.price} {isArabic ? "ر.س" : "SAR"}</td>
                      <td className="p-3 text-right">{item.total} {isArabic ? "ر.س" : "SAR"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>{isArabic ? "المجموع الفرعي:" : "Subtotal:"}</span>
                <span>{quotation.subtotal} {isArabic ? "ر.س" : "SAR"}</span>
              </div>
              <div className="flex justify-between">
                <span>{isArabic ? "الخصم:" : "Discount:"}</span>
                <span>-{quotation.discount} {isArabic ? "ر.س" : "SAR"}</span>
              </div>
              <div className="flex justify-between">
                <span>{isArabic ? `الضريبة (${quotation.taxRate}%):` : `Tax (${quotation.taxRate}%):`}</span>
                <span>{quotation.taxAmount} {isArabic ? "ر.س" : "SAR"}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>{isArabic ? "المجموع الكلي:" : "Total:"}</span>
                <span>{quotation.total} {isArabic ? "ر.س" : "SAR"}</span>
              </div>
            </div>
          </div>

          {quotation.notes && (
            <div>
              <h4 className="font-medium mb-2">{isArabic ? "ملاحظات" : "Notes"}</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">{quotation.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
