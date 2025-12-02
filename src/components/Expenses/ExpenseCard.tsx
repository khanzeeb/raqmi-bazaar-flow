// ExpenseCard - Single expense display component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Car, Home, Zap, Calendar } from "lucide-react";
import { Expense, ExpenseCategory, ExpenseStatus } from "@/types/expense.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExpenseCardProps {
  expense: Expense;
  onViewDetails: () => void;
  onEdit: () => void;
  onAttachReceipt: () => void;
  onApprovePayment: () => void;
}

export const ExpenseCard = ({ expense, onViewDetails, onEdit, onAttachReceipt, onApprovePayment }: ExpenseCardProps) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors: Record<ExpenseCategory, string> = {
      rent: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      utilities: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      transport: 'bg-green-500/10 text-green-700 border-green-500/20',
      office: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      marketing: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
      maintenance: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
      other: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    };
    return colors[category] || colors.other;
  };

  const getCategoryText = (category: ExpenseCategory) => {
    const texts: Record<ExpenseCategory, { ar: string; en: string }> = {
      rent: { ar: 'إيجار', en: 'Rent' },
      utilities: { ar: 'مرافق', en: 'Utilities' },
      transport: { ar: 'مواصلات', en: 'Transport' },
      office: { ar: 'مكتب', en: 'Office' },
      marketing: { ar: 'تسويق', en: 'Marketing' },
      maintenance: { ar: 'صيانة', en: 'Maintenance' },
      other: { ar: 'أخرى', en: 'Other' },
    };
    return texts[category]?.[isArabic ? 'ar' : 'en'] || category;
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Partial<Record<ExpenseCategory, any>> = { rent: Home, utilities: Zap, transport: Car, office: Receipt };
    const Icon = icons[category] || Receipt;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusColor = (status: ExpenseStatus) => {
    const colors: Record<ExpenseStatus, string> = {
      pending: 'bg-red-500/10 text-red-700 border-red-500/20',
      approved: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      paid: 'bg-green-500/10 text-green-700 border-green-500/20',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: ExpenseStatus) => {
    const texts: Record<ExpenseStatus, { ar: string; en: string }> = {
      pending: { ar: 'معلق', en: 'Pending' },
      approved: { ar: 'معتمد', en: 'Approved' },
      paid: { ar: 'مدفوع', en: 'Paid' },
    };
    return texts[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentMethodText = (method: Expense['paymentMethod']) => {
    const texts = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      card: { ar: 'بطاقة', en: 'Card' },
    };
    return texts[method]?.[isArabic ? 'ar' : 'en'] || method;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {expense.expenseNumber}
              {getCategoryIcon(expense.category)}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
            {expense.vendor && (
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'المورد:' : 'Vendor:'} {expense.vendor}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-col items-end">
            <Badge className={getCategoryColor(expense.category)}>{getCategoryText(expense.category)}</Badge>
            <Badge className={getStatusColor(expense.status)}>{getStatusText(expense.status)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'المبلغ' : 'Amount'}</p>
            <p className="font-semibold text-lg">{expense.amount.toLocaleString()} {currencySymbol}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</p>
            <p className="font-medium">{getPaymentMethodText(expense.paymentMethod)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'التاريخ' : 'Date'}</p>
            <p className="font-medium flex items-center gap-1"><Calendar className="w-3 h-3" />{expense.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? 'الإيصال' : 'Receipt'}</p>
            <Badge variant={expense.receiptAttached ? 'default' : 'secondary'}>
              {expense.receiptAttached ? (isArabic ? 'مرفق' : 'Attached') : (isArabic ? 'غير مرفق' : 'Not Attached')}
            </Badge>
          </div>
        </div>

        {expense.notes && (
          <div className="border-t pt-3">
            <p className="text-sm text-muted-foreground mb-1">{isArabic ? 'ملاحظات:' : 'Notes:'}</p>
            <p className="text-sm">{expense.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            {isArabic ? 'عرض التفاصيل' : 'View Details'}
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            {isArabic ? 'تعديل' : 'Edit'}
          </Button>
          {!expense.receiptAttached && (
            <Button variant="outline" size="sm" onClick={onAttachReceipt}>
              {isArabic ? 'إرفاق إيصال' : 'Attach Receipt'}
            </Button>
          )}
          {expense.status === 'pending' && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onApprovePayment}>
              {isArabic ? 'اعتماد الدفع' : 'Approve Payment'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
