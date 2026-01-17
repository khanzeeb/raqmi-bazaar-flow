// Quotation PDF Export Dialog with Template Selection
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileText, Eye, Settings2, Building2 } from 'lucide-react';
import { Quotation } from '@/types/quotation.types';
import { 
  PDFTemplateId, 
  PDFExportOptions, 
  PDF_TEMPLATES, 
  DEFAULT_EXPORT_OPTIONS 
} from '../types/pdf-templates';
import { QuotationPDFService } from '../services/quotation-pdf.service';
import { useToast } from '@/hooks/use-toast';

interface QuotationPDFDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: Quotation;
  isArabic?: boolean;
}

export function QuotationPDFDialog({ 
  open, 
  onOpenChange, 
  quotation,
  isArabic = false 
}: QuotationPDFDialogProps) {
  const { toast } = useToast();
  const [options, setOptions] = useState<PDFExportOptions>({
    ...DEFAULT_EXPORT_OPTIONS,
    language: isArabic ? 'ar' : 'en'
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const updateOption = <K extends keyof PDFExportOptions>(
    key: K, 
    value: PDFExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
    setPreviewUrl(null); // Reset preview when options change
  };

  const updateCompanyInfo = (key: keyof PDFExportOptions['companyInfo'], value: string) => {
    setOptions(prev => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [key]: value }
    }));
    setPreviewUrl(null);
  };

  const handlePreview = () => {
    try {
      const service = new QuotationPDFService(quotation, options);
      const dataUri = service.getDataUri();
      setPreviewUrl(dataUri);
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في إنشاء المعاينة' : 'Failed to generate preview',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = () => {
    try {
      const service = new QuotationPDFService(quotation, options);
      service.download();
      toast({
        title: isArabic ? 'تم التحميل' : 'Downloaded',
        description: isArabic 
          ? `تم تحميل عرض السعر ${quotation.quotationNumber}`
          : `Quotation ${quotation.quotationNumber} downloaded`
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في تحميل PDF' : 'Failed to download PDF',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isArabic ? 'تصدير عرض السعر كـ PDF' : 'Export Quotation as PDF'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="template" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="template" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {isArabic ? 'القالب' : 'Template'}
              </TabsTrigger>
              <TabsTrigger value="options" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                {isArabic ? 'الخيارات' : 'Options'}
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {isArabic ? 'بيانات الشركة' : 'Company'}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="template" className="m-0">
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    {isArabic ? 'اختر القالب' : 'Select Template'}
                  </Label>
                  <RadioGroup
                    value={options.template}
                    onValueChange={(value) => updateOption('template', value as PDFTemplateId)}
                    className="grid grid-cols-2 gap-4"
                  >
                    {Object.values(PDF_TEMPLATES).map((template) => (
                      <div key={template.id} className="relative">
                        <RadioGroupItem
                          value={template.id}
                          id={template.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={template.id}
                          className="flex flex-col gap-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors"
                        >
                          {/* Template preview colors */}
                          <div className="flex gap-1 mb-2">
                            <div 
                              className="w-6 h-6 rounded" 
                              style={{ backgroundColor: template.colors.primary }}
                            />
                            <div 
                              className="w-6 h-6 rounded" 
                              style={{ backgroundColor: template.colors.secondary }}
                            />
                            <div 
                              className="w-6 h-6 rounded" 
                              style={{ backgroundColor: template.colors.accent }}
                            />
                          </div>
                          <span className="font-medium">
                            {isArabic ? template.name.ar : template.name.en}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {isArabic ? template.description.ar : template.description.en}
                          </span>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                            <span>{template.headerStyle}</span>
                            <span>•</span>
                            <span>{template.tableStyle}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="options" className="m-0 space-y-6">
                {/* Language */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    {isArabic ? 'اللغة' : 'Language'}
                  </Label>
                  <RadioGroup
                    value={options.language}
                    onValueChange={(value) => updateOption('language', value as 'en' | 'ar')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="en" id="lang-en" />
                      <Label htmlFor="lang-en">English</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ar" id="lang-ar" />
                      <Label htmlFor="lang-ar">العربية</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Toggle options */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    {isArabic ? 'تضمين' : 'Include'}
                  </Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-notes" className="text-sm font-normal">
                        {isArabic ? 'الملاحظات' : 'Notes'}
                      </Label>
                      <Switch
                        id="include-notes"
                        checked={options.includeNotes}
                        onCheckedChange={(checked) => updateOption('includeNotes', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-terms" className="text-sm font-normal">
                        {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
                      </Label>
                      <Switch
                        id="include-terms"
                        checked={options.includeTerms}
                        onCheckedChange={(checked) => updateOption('includeTerms', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-validity" className="text-sm font-normal">
                        {isArabic ? 'تاريخ الصلاحية' : 'Validity Date'}
                      </Label>
                      <Switch
                        id="show-validity"
                        checked={options.showValidityDate}
                        onCheckedChange={(checked) => updateOption('showValidityDate', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="company" className="m-0 space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="company-name">
                    {isArabic ? 'اسم الشركة' : 'Company Name'}
                  </Label>
                  <Input
                    id="company-name"
                    value={options.companyInfo.name}
                    onChange={(e) => updateCompanyInfo('name', e.target.value)}
                    placeholder={isArabic ? 'أدخل اسم الشركة' : 'Enter company name'}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="company-address">
                    {isArabic ? 'العنوان' : 'Address'}
                  </Label>
                  <Input
                    id="company-address"
                    value={options.companyInfo.address || ''}
                    onChange={(e) => updateCompanyInfo('address', e.target.value)}
                    placeholder={isArabic ? 'أدخل العنوان' : 'Enter address'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="company-phone">
                      {isArabic ? 'الهاتف' : 'Phone'}
                    </Label>
                    <Input
                      id="company-phone"
                      value={options.companyInfo.phone || ''}
                      onChange={(e) => updateCompanyInfo('phone', e.target.value)}
                      placeholder="+966 xxx xxx xxxx"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="company-email">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'}
                    </Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={options.companyInfo.email || ''}
                      onChange={(e) => updateCompanyInfo('email', e.target.value)}
                      placeholder="info@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="company-tax">
                    {isArabic ? 'الرقم الضريبي' : 'Tax Registration Number'}
                  </Label>
                  <Input
                    id="company-tax"
                    value={options.companyInfo.taxNumber || ''}
                    onChange={(e) => updateCompanyInfo('taxNumber', e.target.value)}
                    placeholder={isArabic ? 'أدخل الرقم الضريبي' : 'Enter tax number'}
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Preview section */}
        {previewUrl && (
          <div className="border rounded-lg mt-4 h-64 overflow-hidden">
            <iframe 
              src={previewUrl} 
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            {isArabic ? 'معاينة' : 'Preview'}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? 'تحميل PDF' : 'Download PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
