// PaymentCard - Single payment display component
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Payment, PaymentStatus } from "@/types/payment.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaymentCardProps {
  payment: Payment;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PaymentCard = ({ payment, onView, onEdit, onDelete }: PaymentCardProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  const getStatusColor = (status: PaymentStatus) => {
    const colors: Record<PaymentStatus, string> = {
      completed: 'bg-green-500/10 text-green-700 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      failed: 'bg-red-500/10 text-red-700 border-red-500/20',
      cancelled: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: PaymentStatus) => {
    const texts: Record<PaymentStatus, { ar: string; en: string }> = {
      completed: { ar: 'مكتمل', en: 'Completed' },
      pending: { ar: 'معلق', en: 'Pending' },
      failed: { ar: 'فاشل', en: 'Failed' },
      cancelled: { ar: 'ملغى', en: 'Cancelled' },
    };
    return texts[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentMethodText = (method: Payment['paymentMethod']) => {
    const texts = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      credit: { ar: 'آجل', en: 'Credit' },
      check: { ar: 'شيك', en: 'Check' },
    };
    return texts[method]?.[isArabic ? 'ar' : 'en'] || method;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{payment.paymentNumber}</h3>
            <p className="text-sm text-muted-foreground">{payment.customerName}</p>
          </div>
          <Badge className={getStatusColor(payment.status)}>{getStatusText(payment.status)}</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'المبلغ' : 'Amount'}</p>
            <p className="font-semibold">{payment.amount.toLocaleString()} {currencySymbol}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'طريقة الدفع' : 'Method'}</p>
            <p className="font-medium">{getPaymentMethodText(payment.paymentMethod)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'التاريخ' : 'Date'}</p>
            <p className="font-medium">{payment.paymentDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'المرجع' : 'Reference'}</p>
            <p className="font-medium">{payment.reference || '-'}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" />{isArabic ? 'عرض' : 'View'}
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />{isArabic ? 'تعديل' : 'Edit'}
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-1" />{isArabic ? 'حذف' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
