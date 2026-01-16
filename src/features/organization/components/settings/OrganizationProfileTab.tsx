import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRTL } from "@/hooks/useRTL";
import { useOrganization } from '../../contexts/OrganizationContext';
import { Building2, Globe, MapPin, Save, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const TIMEZONES = [
  { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
];

const CURRENCIES = [
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

const INDUSTRIES = [
  { value: 'technology', label: { en: 'Technology', ar: 'تقنية' } },
  { value: 'retail', label: { en: 'Retail', ar: 'تجزئة' } },
  { value: 'wholesale', label: { en: 'Wholesale', ar: 'جملة' } },
  { value: 'manufacturing', label: { en: 'Manufacturing', ar: 'تصنيع' } },
  { value: 'services', label: { en: 'Services', ar: 'خدمات' } },
  { value: 'healthcare', label: { en: 'Healthcare', ar: 'رعاية صحية' } },
  { value: 'education', label: { en: 'Education', ar: 'تعليم' } },
  { value: 'other', label: { en: 'Other', ar: 'أخرى' } },
];

export function OrganizationProfileTab() {
  const { isArabic, isRTL } = useRTL();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  
  const [formData, setFormData] = useState({
    name: currentOrganization?.name || '',
    slug: currentOrganization?.slug || '',
    industry: currentOrganization?.industry || '',
    taxNumber: currentOrganization?.taxNumber || '',
    currency: currentOrganization?.currency || 'SAR',
    timezone: currentOrganization?.timezone || 'Asia/Riyadh',
    street: currentOrganization?.address?.street || '',
    city: currentOrganization?.address?.city || '',
    state: currentOrganization?.address?.state || '',
    country: currentOrganization?.address?.country || 'Saudi Arabia',
    postalCode: currentOrganization?.address?.postalCode || '',
    invoicePrefix: currentOrganization?.settings?.invoicePrefix || 'INV',
    quotationPrefix: currentOrganization?.settings?.quotationPrefix || 'QT',
    expensePrefix: currentOrganization?.settings?.expensePrefix || 'EXP',
    defaultTaxRate: currentOrganization?.settings?.defaultTaxRate || 15,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Call API to update organization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: isArabic ? 'تم الحفظ' : 'Saved',
        description: isArabic ? 'تم حفظ إعدادات المنظمة بنجاح' : 'Organization settings saved successfully',
      });
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في حفظ الإعدادات' : 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isArabic ? 'المعلومات الأساسية' : 'Basic Information'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'معلومات المنظمة الأساسية' : 'Basic organization details'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <div>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                {isArabic ? 'رفع شعار' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic ? 'PNG, JPG حتى 2MB' : 'PNG, JPG up to 2MB'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isArabic ? 'اسم المنظمة' : 'Organization Name'}</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={isArabic ? 'اسم المنظمة' : 'Organization name'}
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'المعرف الفريد' : 'Slug'}</Label>
              <Input
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="my-organization"
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'الصناعة' : 'Industry'}</Label>
              <Select value={formData.industry} onValueChange={(v) => handleChange('industry', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'اختر الصناعة' : 'Select industry'} />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(ind => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {isArabic ? ind.label.ar : ind.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'الرقم الضريبي' : 'Tax Number (VAT)'}</Label>
              <Input
                value={formData.taxNumber}
                onChange={(e) => handleChange('taxNumber', e.target.value)}
                placeholder="300000000000003"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {isArabic ? 'الإعدادات الإقليمية' : 'Regional Settings'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'العملة والمنطقة الزمنية' : 'Currency and timezone settings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isArabic ? 'العملة الافتراضية' : 'Default Currency'}</Label>
              <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(cur => (
                    <SelectItem key={cur.value} value={cur.value}>{cur.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'المنطقة الزمنية' : 'Timezone'}</Label>
              <Select value={formData.timezone} onValueChange={(v) => handleChange('timezone', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'نسبة الضريبة الافتراضية' : 'Default Tax Rate (%)'}</Label>
              <Input
                type="number"
                value={formData.defaultTaxRate}
                onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value))}
                min={0}
                max={100}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isArabic ? 'العنوان' : 'Address'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'عنوان المنظمة' : 'Organization address'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>{isArabic ? 'الشارع' : 'Street Address'}</Label>
              <Textarea
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder={isArabic ? 'عنوان الشارع' : 'Street address'}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'المدينة' : 'City'}</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder={isArabic ? 'المدينة' : 'City'}
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'المنطقة' : 'State/Region'}</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder={isArabic ? 'المنطقة' : 'State/Region'}
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'الدولة' : 'Country'}</Label>
              <Input
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder={isArabic ? 'الدولة' : 'Country'}
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'الرمز البريدي' : 'Postal Code'}</Label>
              <Input
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder={isArabic ? 'الرمز البريدي' : 'Postal code'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Prefixes */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'بادئات المستندات' : 'Document Prefixes'}</CardTitle>
          <CardDescription>
            {isArabic ? 'بادئات أرقام المستندات' : 'Document number prefixes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{isArabic ? 'بادئة الفاتورة' : 'Invoice Prefix'}</Label>
              <Input
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                placeholder="INV"
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'بادئة عرض السعر' : 'Quotation Prefix'}</Label>
              <Input
                value={formData.quotationPrefix}
                onChange={(e) => handleChange('quotationPrefix', e.target.value)}
                placeholder="QT"
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'بادئة المصروف' : 'Expense Prefix'}</Label>
              <Input
                value={formData.expensePrefix}
                onChange={(e) => handleChange('expensePrefix', e.target.value)}
                placeholder="EXP"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving 
            ? (isArabic ? 'جاري الحفظ...' : 'Saving...') 
            : (isArabic ? 'حفظ التغييرات' : 'Save Changes')}
        </Button>
      </div>
    </div>
  );
}
