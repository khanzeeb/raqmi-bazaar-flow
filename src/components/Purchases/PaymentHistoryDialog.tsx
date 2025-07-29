import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: {
    id: string;
    purchaseNumber: string;
    supplier: { name: string };
    total: number;
    paidAmount: number;
    remainingAmount: number;
    paymentHistory: {
      id: string;
      amount: number;
      date: string;
      method: 'cash' | 'bank_transfer' | 'check';
      reference?: string;
    }[];
  };
}

export function PaymentHistoryDialog({
  open,
  onOpenChange,
  purchase,
}: PaymentHistoryDialogProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const getPaymentMethodText = (method: string) => {
    const methodMap = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      check: { ar: 'شيك', en: 'Check' }
    };
    return methodMap[method as keyof typeof methodMap]?.[isArabic ? 'ar' : 'en'] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'bank_transfer': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'check': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[80vh] overflow-y-auto ${isArabic ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
            {isArabic ? 'تاريخ المدفوعات' : 'Payment History'}
          </DialogTitle>
        </DialogHeader>

        {purchase && (
          <div className="space-y-4">
            {/* Purchase Summary */}
            <Card>
              <CardContent className="p-4">
                <div className={`flex justify-between items-start mb-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h3 className="font-semibold">{purchase.purchaseNumber}</h3>
                    <p className="text-sm text-muted-foreground">{purchase.supplier.name}</p>
                  </div>
                </div>
                
                <div className={`grid grid-cols-3 gap-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'إجمالي المبلغ' : 'Total Amount'}
                    </p>
                    <p className="font-semibold">
                      {purchase.total.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'المبلغ المدفوع' : 'Paid Amount'}
                    </p>
                    <p className="font-semibold text-green-600">
                      {purchase.paidAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'المبلغ المتبقي' : 'Remaining Amount'}
                    </p>
                    <p className="font-semibold text-orange-600">
                      {purchase.remainingAmount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <div>
              <h4 className={`font-medium mb-3 ${isArabic ? 'text-right' : 'text-left'}`}>
                {isArabic ? 'سجل المدفوعات' : 'Payment Records'}
              </h4>
              
              {purchase.paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {purchase.paymentHistory.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                            <div className={isArabic ? 'text-right' : 'text-left'}>
                              <p className="font-semibold">
                                {payment.amount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                              </p>
                              {payment.reference && (
                                <p className="text-xs text-muted-foreground">
                                  {isArabic ? 'المرجع:' : 'Ref:'} {payment.reference}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={`flex flex-col items-end gap-2 ${isArabic ? 'items-start' : 'items-end'}`}>
                            <Badge className={getPaymentMethodColor(payment.method)}>
                              {getPaymentMethodText(payment.method)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      {isArabic ? 'لا توجد مدفوعات مسجلة' : 'No payments recorded'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}