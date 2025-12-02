// InvoiceCard - Single invoice display component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Eye, Printer, Download, Send } from "lucide-react";
import { Invoice, InvoiceStatus } from "@/types/invoice.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface InvoiceCardProps {
  invoice: Invoice;
  onView: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onSend: () => void;
  onMarkPaid: () => void;
}

export const InvoiceCard = ({ invoice, onView, onPrint, onDownload, onSend, onMarkPaid }: InvoiceCardProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  const getStatusColor = (status: InvoiceStatus) => {
    const colors: Record<InvoiceStatus, string> = {
      draft: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
      sent: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      paid: 'bg-green-500/10 text-green-700 border-green-500/20',
      overdue: 'bg-red-500/10 text-red-700 border-red-500/20',
      cancelled: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    };
    return colors[status] || colors.draft;
  };

  const getStatusText = (status: InvoiceStatus) => {
    const texts: Record<InvoiceStatus, { ar: string; en: string }> = {
      draft: { ar: 'مسودة', en: 'Draft' },
      sent: { ar: 'مرسلة', en: 'Sent' },
      paid: { ar: 'مدفوعة', en: 'Paid' },
      overdue: { ar: 'متأخرة', en: 'Overdue' },
      cancelled: { ar: 'ملغاة', en: 'Cancelled' },
    };
    return texts[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getLanguageText = (lang: Invoice['language']) => {
    const texts = { ar: { ar: 'عربي', en: 'Arabic' }, en: { ar: 'إنجليزي', en: 'English' }, both: { ar: 'ثنائي اللغة', en: 'Bilingual' } };
    return texts[lang]?.[isArabic ? 'ar' : 'en'] || lang;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {invoice.invoiceNumber}
              {invoice.qrCode && <QrCode className="w-4 h-4" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {invoice.customer.name}{invoice.customer.phone && ` - ${invoice.customer.phone}`}
            </p>
            {invoice.customer.taxId && (
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'الرقم الضريبي:' : 'Tax ID:'} {invoice.customer.taxId}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-col items-end">
            <Badge className={getStatusColor(invoice.status)}>{getStatusText(invoice.status)}</Badge>
            <Badge variant="outline">{getLanguageText(invoice.language)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'المجموع' : 'Total'}</p>
            <p className="font-semibold text-lg">{invoice.total.toLocaleString()} {currencySymbol}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'تاريخ الإصدار' : 'Issue Date'}</p>
            <p className="font-medium">{invoice.issueDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</p>
            <p className="font-medium">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'شروط الدفع' : 'Payment Terms'}</p>
            <p className="font-medium">{invoice.paymentTerms}</p>
          </div>
        </div>

        {/* Tax Details */}
        <div className="border-t pt-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'} </span>
              <span className="font-medium">{invoice.subtotal.toLocaleString()} {currencySymbol}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{isArabic ? 'الضريبة' : 'Tax'} ({invoice.taxRate}%): </span>
              <span className="font-medium">{invoice.taxAmount.toLocaleString()} {currencySymbol}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{isArabic ? 'الخصم:' : 'Discount:'} </span>
              <span className="font-medium">{invoice.discount.toLocaleString()} {currencySymbol}</span>
            </div>
          </div>
        </div>

        {/* Items Summary */}
        <div className="border-t pt-3 mb-4">
          <p className="text-sm text-muted-foreground mb-2">{isArabic ? 'العناصر' : 'Items'} ({invoice.items.length})</p>
          <div className="space-y-1">
            {invoice.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{item.total.toLocaleString()} {currencySymbol}</span>
              </div>
            ))}
            {invoice.items.length > 2 && (
              <p className="text-xs text-muted-foreground">
                {isArabic ? `و ${invoice.items.length - 2} عنصر آخر...` : `and ${invoice.items.length - 2} more items...`}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t flex-wrap">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
            {isArabic ? 'عرض' : 'View'}
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
            {isArabic ? 'طباعة' : 'Print'}
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onSend}>
            <Send className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
            {isArabic ? 'إرسال' : 'Send'}
          </Button>
          {invoice.status !== 'paid' && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onMarkPaid}>
              {isArabic ? 'تسجيل دفعة' : 'Record Payment'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
