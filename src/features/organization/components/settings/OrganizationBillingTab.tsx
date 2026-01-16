import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRTL } from "@/hooks/useRTL";
import { useOrganization, PermissionGate } from '@/features/organization';
import { 
  CreditCard, Package, Users, FileText, Download, 
  Calendar, CheckCircle, ArrowUpRight, Zap, Shield
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock billing data
const MOCK_SUBSCRIPTION = {
  plan: 'business',
  status: 'active',
  currentPeriodEnd: '2024-02-15',
  amount: 299,
  currency: 'SAR',
  interval: 'month',
};

const MOCK_USAGE = {
  users: { current: 4, limit: 10 },
  storage: { current: 2.5, limit: 10, unit: 'GB' },
  invoices: { current: 156, limit: 500 },
  products: { current: 234, limit: 1000 },
};

const MOCK_INVOICES = [
  { id: 'inv-001', date: '2024-01-15', amount: 299, status: 'paid' },
  { id: 'inv-002', date: '2023-12-15', amount: 299, status: 'paid' },
  { id: 'inv-003', date: '2023-11-15', amount: 299, status: 'paid' },
];

const PLANS = [
  {
    id: 'starter',
    name: { en: 'Starter', ar: 'البداية' },
    price: 99,
    features: ['5 Users', '100 Invoices/mo', '100 Products', '2GB Storage'],
  },
  {
    id: 'business',
    name: { en: 'Business', ar: 'الأعمال' },
    price: 299,
    features: ['10 Users', '500 Invoices/mo', '1000 Products', '10GB Storage'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: { en: 'Enterprise', ar: 'المؤسسات' },
    price: 799,
    features: ['Unlimited Users', 'Unlimited Invoices', 'Unlimited Products', '100GB Storage'],
  },
];

export function OrganizationBillingTab() {
  const { isArabic } = useRTL();
  const { hasPermission } = useOrganization();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount} ${isArabic ? 'ر.س' : 'SAR'}`;
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const canManageBilling = hasPermission('org:billing');

  return (
    <PermissionGate
      permission="org:billing"
      fallback={
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isArabic ? 'غير مصرح' : 'Access Denied'}
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              {isArabic 
                ? 'فقط مالك المنظمة يمكنه الوصول إلى إعدادات الفوترة'
                : 'Only the organization owner can access billing settings'}
            </p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {isArabic ? 'الاشتراك الحالي' : 'Current Subscription'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'تفاصيل خطة اشتراكك' : 'Your subscription plan details'}
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                {isArabic ? 'نشط' : 'Active'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
              <div>
                <h3 className="text-2xl font-bold">
                  {isArabic ? 'خطة الأعمال' : 'Business Plan'}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic ? 'التجديد في' : 'Renews on'} {formatDate(MOCK_SUBSCRIPTION.currentPeriodEnd)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {formatCurrency(MOCK_SUBSCRIPTION.amount)}
                </div>
                <p className="text-muted-foreground">
                  /{isArabic ? 'شهر' : 'month'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Zap className="h-4 w-4" />
                {isArabic ? 'ترقية الخطة' : 'Upgrade Plan'}
              </Button>
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                {isArabic ? 'طريقة الدفع' : 'Payment Method'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'الاستخدام' : 'Usage'}</CardTitle>
            <CardDescription>
              {isArabic ? 'استخدام الموارد في الفترة الحالية' : 'Resource usage for current billing period'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{isArabic ? 'المستخدمين' : 'Users'}</span>
                  </div>
                  <span className="font-medium">
                    {MOCK_USAGE.users.current} / {MOCK_USAGE.users.limit}
                  </span>
                </div>
                <Progress value={getUsagePercentage(MOCK_USAGE.users.current, MOCK_USAGE.users.limit)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{isArabic ? 'الفواتير' : 'Invoices'}</span>
                  </div>
                  <span className="font-medium">
                    {MOCK_USAGE.invoices.current} / {MOCK_USAGE.invoices.limit}
                  </span>
                </div>
                <Progress value={getUsagePercentage(MOCK_USAGE.invoices.current, MOCK_USAGE.invoices.limit)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{isArabic ? 'المنتجات' : 'Products'}</span>
                  </div>
                  <span className="font-medium">
                    {MOCK_USAGE.products.current} / {MOCK_USAGE.products.limit}
                  </span>
                </div>
                <Progress value={getUsagePercentage(MOCK_USAGE.products.current, MOCK_USAGE.products.limit)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{isArabic ? 'التخزين' : 'Storage'}</span>
                  </div>
                  <span className="font-medium">
                    {MOCK_USAGE.storage.current} / {MOCK_USAGE.storage.limit} {MOCK_USAGE.storage.unit}
                  </span>
                </div>
                <Progress value={getUsagePercentage(MOCK_USAGE.storage.current, MOCK_USAGE.storage.limit)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {isArabic ? 'سجل الفواتير' : 'Billing History'}
            </CardTitle>
            <CardDescription>
              {isArabic ? 'الفواتير والمدفوعات السابقة' : 'Previous invoices and payments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_INVOICES.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.id.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {isArabic ? 'مدفوعة' : 'Paid'}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'الخطط المتاحة' : 'Available Plans'}</CardTitle>
            <CardDescription>
              {isArabic ? 'مقارنة بين الخطط المتاحة' : 'Compare available subscription plans'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative p-4 border rounded-lg ${
                    plan.popular ? 'border-primary ring-1 ring-primary' : ''
                  } ${plan.id === MOCK_SUBSCRIPTION.plan ? 'bg-muted/50' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                      {isArabic ? 'الأكثر شعبية' : 'Most Popular'}
                    </Badge>
                  )}
                  <div className="text-center mb-4 pt-2">
                    <h3 className="font-semibold text-lg">
                      {isArabic ? plan.name.ar : plan.name.en}
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                      <span className="text-muted-foreground">/{isArabic ? 'شهر' : 'mo'}</span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full gap-2" 
                    variant={plan.id === MOCK_SUBSCRIPTION.plan ? 'secondary' : 'default'}
                    disabled={plan.id === MOCK_SUBSCRIPTION.plan}
                  >
                    {plan.id === MOCK_SUBSCRIPTION.plan 
                      ? (isArabic ? 'الخطة الحالية' : 'Current Plan')
                      : (
                        <>
                          {isArabic ? 'ترقية' : 'Upgrade'}
                          <ArrowUpRight className="h-4 w-4" />
                        </>
                      )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
