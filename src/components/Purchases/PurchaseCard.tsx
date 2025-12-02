// PurchaseCard - Single purchase display component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Package, Clock, CheckCircle, DollarSign, History } from "lucide-react";
import { Purchase, PurchaseStatus } from "@/types/purchase.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface PurchaseCardProps {
  purchase: Purchase;
  onViewDetails: () => void;
  onMarkReceived: () => void;
  onAddPayment: () => void;
  onViewHistory: () => void;
  onAddToInventory: () => void;
}

export const PurchaseCard = ({ purchase, onViewDetails, onMarkReceived, onAddPayment, onViewHistory, onAddToInventory }: PurchaseCardProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  const getStatusColor = (status: PurchaseStatus) => {
    const colors: Record<PurchaseStatus, string> = {
      pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      received: 'bg-green-500/10 text-green-700 border-green-500/20',
      partial: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      returned: 'bg-red-500/10 text-red-700 border-red-500/20',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: PurchaseStatus) => {
    const texts: Record<PurchaseStatus, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      received: { ar: 'تم الاستلام', en: 'Received' },
      partial: { ar: 'استلام جزئي', en: 'Partial' },
      returned: { ar: 'مرتجع', en: 'Returned' },
    };
    return texts[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentMethodText = (method: Purchase['paymentMethod']) => {
    const texts = {
      full: { ar: 'دفع كامل', en: 'Full Payment' },
      partial: { ar: 'دفع جزئي', en: 'Partial Payment' },
      credit: { ar: 'آجل', en: 'Credit' },
    };
    return texts[method]?.[isArabic ? 'ar' : 'en'] || method;
  };

  const getPaymentStatusColor = (status: Purchase['paymentStatus']) => {
    const colors = {
      paid: 'bg-green-500/10 text-green-700 border-green-500/20',
      partial: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      unpaid: 'bg-red-500/10 text-red-700 border-red-500/20',
    };
    return colors[status] || colors.unpaid;
  };

  const getStatusIcon = (status: PurchaseStatus) => {
    const icons = { pending: Clock, received: CheckCircle, partial: Package, returned: Truck };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {purchase.purchaseNumber}
              {getStatusIcon(purchase.status)}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {purchase.supplier.name}{purchase.supplier.phone && ` - ${purchase.supplier.phone}`}
            </p>
          </div>
          <Badge className={getStatusColor(purchase.status)}>{getStatusText(purchase.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'المجموع' : 'Total'}</p>
            <p className="font-semibold">{purchase.total.toLocaleString()} {currencySymbol}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'تاريخ الطلب' : 'Order Date'}</p>
            <p className="font-medium">{purchase.orderDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'التاريخ المتوقع' : 'Expected Date'}</p>
            <p className="font-medium">{purchase.expectedDate || (isArabic ? 'غير محدد' : 'Not set')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</p>
            <Badge className={getPaymentStatusColor(purchase.paymentStatus)}>{getPaymentMethodText(purchase.paymentMethod)}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'حالة الدفع' : 'Payment Status'}</p>
            <p className="font-medium">{purchase.paidAmount.toLocaleString()} / {purchase.total.toLocaleString()} {currencySymbol}</p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="border-t pt-3">
          <p className="text-sm text-muted-foreground mb-2">
            {isArabic ? `العناصر (${purchase.items.length})` : `Items (${purchase.items.length})`}
          </p>
          <div className="space-y-1">
            {purchase.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{item.total.toLocaleString()} {currencySymbol}</span>
              </div>
            ))}
            {purchase.items.length > 2 && (
              <p className="text-xs text-muted-foreground">
                {isArabic ? `و ${purchase.items.length - 2} عنصر آخر...` : `And ${purchase.items.length - 2} more items...`}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t flex-wrap">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            {isArabic ? 'عرض التفاصيل' : 'View Details'}
          </Button>
          <Button variant="outline" size="sm" onClick={onMarkReceived} disabled={purchase.status === 'received'}>
            <Truck className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
            {isArabic ? 'تسجيل الاستلام' : 'Mark Received'}
          </Button>
          <Button variant="outline" size="sm" onClick={onAddPayment}>
            <DollarSign className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
            {isArabic ? 'إضافة دفعة' : 'Add Payment'}
          </Button>
          <Button variant="outline" size="sm" onClick={onViewHistory}>
            <History className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
            {isArabic ? 'سجل المدفوعات' : 'Payment History'}
          </Button>
          {purchase.status === 'received' && !purchase.addedToInventory && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onAddToInventory}>
              {isArabic ? 'إضافة للمخزون' : 'Add to Inventory'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
