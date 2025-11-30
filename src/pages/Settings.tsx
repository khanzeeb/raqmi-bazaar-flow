import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Database,
  Mail,
  Smartphone,
  Key,
  Download,
  Upload,
  Save,
  RefreshCw,
  DollarSign,
  Check
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSettings, CURRENCIES, Currency } from "@/contexts/UserSettingsContext";

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  browserNotifications: boolean;
  salesAlerts: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
}

interface CompanyInfo {
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  crNumber: string;
  website?: string;
}

const Settings = () => {
  const { language, toggleLanguage, setLanguage } = useLanguage();
  const { settings, updateSettings, formatCurrency } = useUserSettings();
  const isArabic = language === 'ar';
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'RAQMI Technology Solutions',
    nameAr: 'شركة رقمي للحلول التقنية',
    email: 'info@raqmi.com',
    phone: '+966112345678',
    address: 'الرياض، المملكة العربية السعودية',
    taxId: '123456789012345',
    crNumber: '1010123456',
    website: 'www.raqmi.com'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    salesAlerts: true,
    lowStockAlerts: true,
    paymentReminders: true
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true
  });

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: boolean | number) => {
    setSecurity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'إدارة إعدادات النظام والحساب' : 'Manage system and account settings'}
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {isArabic ? 'الشركة' : 'Company'}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {isArabic ? 'التنبيهات' : 'Notifications'}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {isArabic ? 'الأمان' : 'Security'}
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {isArabic ? 'اللغة' : 'Language'}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {isArabic ? 'المظهر' : 'Appearance'}
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            {isArabic ? 'البيانات' : 'Data'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'معلومات الشركة' : 'Company Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">{isArabic ? 'اسم الشركة (انجليزي)' : 'Company Name (English)'}</Label>
                  <Input
                    id="companyName"
                    value={companyInfo.name}
                    onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyNameAr">{isArabic ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}</Label>
                  <Input
                    id="companyNameAr"
                    value={companyInfo.nameAr}
                    onChange={(e) => handleCompanyInfoChange('nameAr', e.target.value)}
                    className={isArabic ? 'text-right' : ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <Input
                    id="phone"
                    value={companyInfo.phone}
                    onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">{isArabic ? 'العنوان' : 'Address'}</Label>
                <Input
                  id="address"
                  value={companyInfo.address}
                  onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="taxId">{isArabic ? 'الرقم الضريبي' : 'Tax ID'}</Label>
                  <Input
                    id="taxId"
                    value={companyInfo.taxId}
                    onChange={(e) => handleCompanyInfoChange('taxId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="crNumber">{isArabic ? 'رقم السجل التجاري' : 'CR Number'}</Label>
                  <Input
                    id="crNumber"
                    value={companyInfo.crNumber}
                    onChange={(e) => handleCompanyInfoChange('crNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">{isArabic ? 'الموقع الإلكتروني' : 'Website'}</Label>
                  <Input
                    id="website"
                    value={companyInfo.website}
                    onChange={(e) => handleCompanyInfoChange('website', e.target.value)}
                  />
                </div>
              </div>

              <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                <Button>
                  <Save className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات التنبيهات' : 'Notification Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{isArabic ? 'طرق التنبيه' : 'Notification Methods'}</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    <div>
                      <Label>{isArabic ? 'تنبيهات البريد الإلكتروني' : 'Email Notifications'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'استقبال التنبيهات عبر البريد الإلكتروني' : 'Receive notifications via email'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4" />
                    <div>
                      <Label>{isArabic ? 'تنبيهات الرسائل النصية' : 'SMS Notifications'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'استقبال التنبيهات عبر الرسائل النصية' : 'Receive notifications via SMS'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <div>
                      <Label>{isArabic ? 'تنبيهات المتصفح' : 'Browser Notifications'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'استقبال التنبيهات في المتصفح' : 'Receive notifications in browser'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.browserNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('browserNotifications', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{isArabic ? 'أنواع التنبيهات' : 'Notification Types'}</h3>
                
                <div className="flex items-center justify-between">
                  <Label>{isArabic ? 'تنبيهات المبيعات' : 'Sales Alerts'}</Label>
                  <Switch
                    checked={notifications.salesAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('salesAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{isArabic ? 'تنبيهات نقص المخزون' : 'Low Stock Alerts'}</Label>
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('lowStockAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{isArabic ? 'تذكير المدفوعات' : 'Payment Reminders'}</Label>
                  <Switch
                    checked={notifications.paymentReminders}
                    onCheckedChange={(checked) => handleNotificationChange('paymentReminders', checked)}
                  />
                </div>
              </div>

              <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                <Button>
                  <Save className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات الأمان' : 'Security Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4" />
                  <div>
                    <Label>{isArabic ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'حماية إضافية لحسابك' : 'Extra security for your account'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>{isArabic ? 'تنبيهات تسجيل الدخول' : 'Login Notifications'}</Label>
                <Switch
                  checked={security.loginNotifications}
                  onCheckedChange={(checked) => handleSecurityChange('loginNotifications', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">{isArabic ? 'انتهاء الجلسة (دقائق)' : 'Session Timeout (minutes)'}</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">{isArabic ? 'انتهاء كلمة المرور (أيام)' : 'Password Expiry (days)'}</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={security.passwordExpiry}
                    onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                <Button>
                  <Save className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات اللغة والعملة' : 'Language & Currency Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {isArabic ? 'اللغة' : 'Language'}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{isArabic ? 'اللغة المفضلة' : 'Preferred Language'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? (isArabic ? 'العربية' : 'Arabic') : (isArabic ? 'الإنجليزية' : 'English')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setLanguage('en')} 
                      variant={language === 'en' ? 'default' : 'outline'}
                      size="sm"
                    >
                      English
                    </Button>
                    <Button 
                      onClick={() => setLanguage('ar')} 
                      variant={language === 'ar' ? 'default' : 'outline'}
                      size="sm"
                    >
                      العربية
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Currency Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {isArabic ? 'العملة' : 'Currency'}
                </h3>
                <div>
                  <Label>{isArabic ? 'العملة المفضلة' : 'Preferred Currency'}</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isArabic ? 'اختر العملة المستخدمة في جميع أنحاء النظام' : 'Select the currency used throughout the system'}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {CURRENCIES.map((currency) => (
                      <Button
                        key={currency.code}
                        variant={settings.currency.code === currency.code ? 'default' : 'outline'}
                        className={`flex flex-col items-center gap-1 h-auto py-3 ${settings.currency.code === currency.code ? '' : 'hover:bg-muted'}`}
                        onClick={() => updateSettings({ currency })}
                      >
                        <span className="text-lg font-bold">{currency.symbol}</span>
                        <span className="text-xs">{currency.code}</span>
                        <span className="text-xs text-muted-foreground">
                          {isArabic ? currency.nameAr : currency.nameEn}
                        </span>
                        {settings.currency.code === currency.code && (
                          <Check className="w-4 h-4 absolute top-1 right-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <Label>{isArabic ? 'معاينة التنسيق' : 'Format Preview'}</Label>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <span className="text-sm text-muted-foreground">{isArabic ? 'مثال:' : 'Example:'}</span>
                      <p className="text-lg font-semibold">{formatCurrency(1234.56)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{isArabic ? 'مبلغ كبير:' : 'Large amount:'}</span>
                      <p className="text-lg font-semibold">{formatCurrency(125000)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tax Rate Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{isArabic ? 'إعدادات الضريبة' : 'Tax Settings'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxRate">{isArabic ? 'معدل الضريبة الافتراضي (%)' : 'Default Tax Rate (%)'}</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>

              <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                <Button>
                  <Save className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات المظهر' : 'Appearance Settings'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {isArabic ? 'إعدادات المظهر والثيمات قريباً...' : 'Appearance and theme settings coming soon...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إدارة البيانات' : 'Data Management'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  <Download className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'تصدير البيانات' : 'Export Data'}
                </Button>
                <Button variant="outline">
                  <Upload className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'استيراد البيانات' : 'Import Data'}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-destructive">{isArabic ? 'منطقة خطر' : 'Danger Zone'}</Label>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إعادة تعيين البيانات ستحذف جميع المعلومات نهائياً' : 'Resetting data will permanently delete all information'}
                </p>
                <Button variant="destructive" size="sm">
                  <RefreshCw className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'إعادة تعيين البيانات' : 'Reset Data'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;