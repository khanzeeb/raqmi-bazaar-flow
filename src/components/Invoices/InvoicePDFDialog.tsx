import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/pages/Invoices";

interface InvoicePDFDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const InvoicePDFDialog: React.FC<InvoicePDFDialogProps> = ({
  open,
  onOpenChange,
  invoice
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const [pdfOptions, setPdfOptions] = useState({
    language: 'both' as 'ar' | 'en' | 'both',
    includeQR: true,
    includeNotes: true,
    format: 'A4' as 'A4' | 'Letter',
    orientation: 'portrait' as 'portrait' | 'landscape'
  });

  if (!invoice) return null;

  const handleDownload = () => {
    // Simulate PDF generation
    toast({
      title: isArabic ? "جاري تحميل PDF" : "Downloading PDF",
      description: isArabic ? `تم إنشاء ملف PDF للفاتورة ${invoice.invoiceNumber}` : `PDF generated for invoice ${invoice.invoiceNumber}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isArabic ? 'تحميل PDF' : 'Download PDF'}: {invoice.invoiceNumber}
          </DialogTitle>
          <DialogDescription>
            {isArabic ? 'اختر إعدادات تحميل ملف PDF' : 'Choose PDF download settings'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Language Options */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Label className="text-base font-medium">{isArabic ? 'لغة الفاتورة' : 'Invoice Language'}</Label>
                <Select value={pdfOptions.language} onValueChange={(value) => setPdfOptions(prev => ({ ...prev, language: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">{isArabic ? 'عربي فقط' : 'Arabic Only'}</SelectItem>
                    <SelectItem value="en">{isArabic ? 'إنجليزي فقط' : 'English Only'}</SelectItem>
                    <SelectItem value="both">{isArabic ? 'ثنائي اللغة' : 'Bilingual'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Format Options */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium">{isArabic ? 'حجم الورق' : 'Paper Size'}</Label>
                  <Select value={pdfOptions.format} onValueChange={(value) => setPdfOptions(prev => ({ ...prev, format: value as any }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base font-medium">{isArabic ? 'اتجاه الصفحة' : 'Orientation'}</Label>
                  <Select value={pdfOptions.orientation} onValueChange={(value) => setPdfOptions(prev => ({ ...prev, orientation: value as any }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">{isArabic ? 'عمودي' : 'Portrait'}</SelectItem>
                      <SelectItem value="landscape">{isArabic ? 'أفقي' : 'Landscape'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Label className="text-base font-medium">{isArabic ? 'خيارات إضافية' : 'Additional Options'}</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{isArabic ? 'تضمين رمز الاستجابة السريعة' : 'Include QR Code'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'إضافة رمز QR للدفع الإلكتروني' : 'Add QR code for electronic payment'}
                    </p>
                  </div>
                  <Switch
                    checked={pdfOptions.includeQR}
                    onCheckedChange={(checked) => setPdfOptions(prev => ({ ...prev, includeQR: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{isArabic ? 'تضمين الملاحظات' : 'Include Notes'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'إضافة الملاحظات والشروط' : 'Add notes and terms'}
                    </p>
                  </div>
                  <Switch
                    checked={pdfOptions.includeNotes}
                    onCheckedChange={(checked) => setPdfOptions(prev => ({ ...prev, includeNotes: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Info */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">{isArabic ? 'معاينة الإعدادات:' : 'Settings Preview:'}</p>
                <ul className="space-y-1">
                  <li>• {isArabic ? 'اللغة:' : 'Language:'} {
                    pdfOptions.language === 'ar' ? (isArabic ? 'عربي' : 'Arabic') :
                    pdfOptions.language === 'en' ? (isArabic ? 'إنجليزي' : 'English') :
                    (isArabic ? 'ثنائي اللغة' : 'Bilingual')
                  }</li>
                  <li>• {isArabic ? 'الحجم:' : 'Size:'} {pdfOptions.format} ({pdfOptions.orientation === 'portrait' ? (isArabic ? 'عمودي' : 'Portrait') : (isArabic ? 'أفقي' : 'Landscape')})</li>
                  <li>• {isArabic ? 'رمز QR:' : 'QR Code:'} {pdfOptions.includeQR ? (isArabic ? 'مضمن' : 'Included') : (isArabic ? 'غير مضمن' : 'Not included')}</li>
                  <li>• {isArabic ? 'الملاحظات:' : 'Notes:'} {pdfOptions.includeNotes ? (isArabic ? 'مضمنة' : 'Included') : (isArabic ? 'غير مضمنة' : 'Not included')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {isArabic ? 'تحميل PDF' : 'Download PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};