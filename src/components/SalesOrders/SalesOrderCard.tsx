import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Download, RotateCcw } from "lucide-react";
import { SalesOrder } from "@/types/salesOrder.types";

interface SalesOrderCardProps {
  order: SalesOrder;
  onView: (order: SalesOrder) => void;
  onPrint: (order: SalesOrder) => void;
  onDownload: (order: SalesOrder) => void;
  onReturn: (order: SalesOrder) => void;
  isArabic: boolean;
  t: (key: string) => string;
}

const getStatusColor = (status: SalesOrder['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
    case 'returned': return 'bg-red-500/10 text-red-700 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
};

const getPaymentStatusColor = (status: SalesOrder['paymentStatus']) => {
  switch (status) {
    case 'pending': return 'bg-red-500/10 text-red-700 border-red-500/20';
    case 'partial': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    case 'paid': return 'bg-green-500/10 text-green-700 border-green-500/20';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
};

export const SalesOrderCard = ({ order, onView, onPrint, onDownload, onReturn, isArabic, t }: SalesOrderCardProps) => {
  const getStatusText = (status: SalesOrder['status']) => {
    const statusMap = {
      pending: { ar: 'معلق', en: 'Pending' },
      completed: { ar: 'مكتمل', en: 'Completed' },
      returned: { ar: 'مرتجع', en: 'Returned' }
    };
    return statusMap[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentStatusText = (status: SalesOrder['paymentStatus']) => {
    const statusMap = {
      pending: { ar: 'غير مدفوع', en: 'Unpaid' },
      partial: { ar: 'مدفوع جزئياً', en: 'Partially Paid' },
      paid: { ar: 'مدفوع بالكامل', en: 'Fully Paid' }
    };
    return statusMap[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentModeText = (mode: SalesOrder['paymentMode']) => {
    const modeMap = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      credit: { ar: 'آجل', en: 'Credit' }
    };
    return modeMap[mode]?.[isArabic ? 'ar' : 'en'] || mode;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {order.customer.name}
              {order.customer.phone && ` - ${order.customer.phone}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
              {getPaymentStatusText(order.paymentStatus)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('total')}</p>
            <p className="font-semibold">{order.total.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('payment_method')}</p>
            <p className="font-medium">{getPaymentModeText(order.paymentMode)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('paid_amount')}</p>
            <p className="font-medium">{order.paidAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('date')}</p>
            <p className="font-medium">{order.createdAt}</p>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <p className="text-sm text-muted-foreground mb-2">
            {t('items')} ({order.items.length})
          </p>
          <div className="space-y-1">
            {order.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{item.total.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-muted-foreground">
                {isArabic 
                  ? `و ${order.items.length - 2} عنصر آخر...`
                  : `and ${order.items.length - 2} more items...`
                }
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={() => onView(order)}>
            <Eye className="w-4 h-4 mr-1" />
            {t('view')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPrint(order)}>
            <Printer className="w-4 h-4 mr-1" />
            {t('print')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDownload(order)}>
            <Download className="w-4 h-4 mr-1" />
            {t('download')}
          </Button>
          {order.status === 'completed' && (
            <Button variant="outline" size="sm" onClick={() => onReturn(order)}>
              <RotateCcw className="w-4 h-4 mr-1" />
              {t('return')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
