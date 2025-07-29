import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Share, Copy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/pages/Invoices";

interface InvoiceQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const InvoiceQRDialog: React.FC<InvoiceQRDialogProps> = ({
  open,
  onOpenChange,
  invoice
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();

  if (!invoice) return null;

  // Mock QR code data - in a real app this would be generated
  const qrData = {
    sellerName: "RAQMI Technology Solutions",
    vatNumber: "123456789012345",
    timestamp: new Date().toISOString(),
    invoiceTotal: invoice.total,
    vatTotal: invoice.taxAmount
  };

  const handleCopyQRData = () => {
    const qrText = `Invoice: ${invoice.invoiceNumber}\nAmount: ${invoice.total} SAR\nVAT: ${invoice.taxAmount} SAR\nCustomer: ${invoice.customer.name}`;
    navigator.clipboard.writeText(qrText);
    toast({
      title: isArabic ? "تم النسخ" : "Copied",
      description: isArabic ? "تم نسخ بيانات رمز الاستجابة" : "QR code data copied to clipboard",
    });
  };

  const handleDownloadQR = () => {
    toast({
      title: isArabic ? "تحميل رمز الاستجابة" : "Download QR Code",
      description: isArabic ? "تم تحميل رمز الاستجابة السريعة" : "QR code downloaded successfully",
    });
  };

  const handleShareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoiceNumber}`,
        text: `QR Code for invoice ${invoice.invoiceNumber}`,
      });
    } else {
      toast({
        title: isArabic ? "مشاركة رمز الاستجابة" : "Share QR Code",
        description: isArabic ? "تم إعداد المشاركة" : "QR code ready for sharing",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {isArabic ? 'رمز الاستجابة السريعة' : 'QR Code'}: {invoice.invoiceNumber}
          </DialogTitle>
          <DialogDescription>
            {isArabic ? 'رمز الاستجابة السريعة للدفع الإلكتروني' : 'QR code for electronic payment'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Display */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-4">
                {/* Mock QR Code - in a real app this would be a generated QR code image */}
                <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-8 gap-1 p-4">
                    {Array.from({ length: 64 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 ${
                          Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium">{isArabic ? 'امسح للدفع' : 'Scan to Pay'}</p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'متوافق مع جميع تطبيقات الدفع الإلكتروني' : 'Compatible with all digital payment apps'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">{isArabic ? 'معلومات الفاتورة' : 'Invoice Information'}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'رقم الفاتورة:' : 'Invoice Number:'}</span>
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'العميل:' : 'Customer:'}</span>
                  <div className="font-medium">{invoice.customer.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'المبلغ:' : 'Amount:'}</span>
                  <div className="font-medium">{invoice.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'الضريبة:' : 'VAT:'}</span>
                  <div className="font-medium">{invoice.taxAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span>
                  <div className="font-medium">{invoice.dueDate}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'الحالة:' : 'Status:'}</span>
                  <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                    {invoice.status === 'sent' ? (isArabic ? 'مرسلة' : 'Sent') : 
                     invoice.status === 'paid' ? (isArabic ? 'مدفوعة' : 'Paid') :
                     invoice.status === 'overdue' ? (isArabic ? 'متأخرة' : 'Overdue') :
                     (isArabic ? 'مسودة' : 'Draft')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">{isArabic ? 'تفاصيل رمز الاستجابة' : 'QR Code Details'}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'اسم البائع:' : 'Seller Name:'}</span>
                  <span className="font-medium">{qrData.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'الرقم الضريبي:' : 'VAT Number:'}</span>
                  <span className="font-medium">{qrData.vatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'وقت الإنشاء:' : 'Generated At:'}</span>
                  <span className="font-medium">{new Date(qrData.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'رمز الفاتورة:' : 'Invoice Code:'}</span>
                  <span className="font-medium font-mono">{invoice.qrCode}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCopyQRData} className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              {isArabic ? 'نسخ البيانات' : 'Copy Data'}
            </Button>
            <Button variant="outline" onClick={handleDownloadQR} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {isArabic ? 'تحميل الصورة' : 'Download Image'}
            </Button>
            <Button variant="outline" onClick={handleShareQR} className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              {isArabic ? 'مشاركة' : 'Share'}
            </Button>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                {isArabic ? 'كيفية الاستخدام' : 'How to Use'}
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {isArabic ? 'افتح تطبيق الدفع المصرفي على هاتفك' : 'Open your bank\'s payment app'}</li>
                <li>• {isArabic ? 'اختر "مسح رمز الاستجابة" أو "دفع فاتورة"' : 'Select "Scan QR" or "Pay Invoice"'}</li>
                <li>• {isArabic ? 'وجه الكاميرا نحو الرمز أعلاه' : 'Point camera at the QR code above'}</li>
                <li>• {isArabic ? 'تأكد من المبلغ واضغط "دفع"' : 'Verify amount and tap "Pay"'}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};