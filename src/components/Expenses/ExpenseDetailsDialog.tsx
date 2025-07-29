import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Receipt, DollarSign, User, FileText, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Expense } from "@/pages/Expenses";

interface ExpenseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  onEdit?: (expense: Expense) => void;
}

export function ExpenseDetailsDialog({
  open,
  onOpenChange,
  expense,
  onEdit,
}: ExpenseDetailsDialogProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  if (!expense) return null;

  const getCategoryText = (category: Expense['category']) => {
    if (isArabic) {
      switch (category) {
        case 'rent': return 'إيجار';
        case 'utilities': return 'مرافق';
        case 'transport': return 'مواصلات';
        case 'office': return 'مكتب';
        case 'marketing': return 'تسويق';
        case 'maintenance': return 'صيانة';
        case 'other': return 'أخرى';
        default: return category;
      }
    } else {
      switch (category) {
        case 'rent': return 'Rent';
        case 'utilities': return 'Utilities';
        case 'transport': return 'Transport';
        case 'office': return 'Office';
        case 'marketing': return 'Marketing';
        case 'maintenance': return 'Maintenance';
        case 'other': return 'Other';
        default: return category;
      }
    }
  };

  const getStatusText = (status: Expense['status']) => {
    if (isArabic) {
      switch (status) {
        case 'pending': return 'معلق';
        case 'approved': return 'معتمد';
        case 'paid': return 'مدفوع';
        default: return status;
      }
    } else {
      switch (status) {
        case 'pending': return 'Pending';
        case 'approved': return 'Approved';
        case 'paid': return 'Paid';
        default: return status;
      }
    }
  };

  const getPaymentMethodText = (method: Expense['paymentMethod']) => {
    if (isArabic) {
      switch (method) {
        case 'cash': return 'نقدي';
        case 'bank_transfer': return 'تحويل بنكي';
        case 'card': return 'بطاقة';
        default: return method;
      }
    } else {
      switch (method) {
        case 'cash': return 'Cash';
        case 'bank_transfer': return 'Bank Transfer';
        case 'card': return 'Card';
        default: return method;
      }
    }
  };

  const getCategoryColor = (category: Expense['category']) => {
    switch (category) {
      case 'rent': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'utilities': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'transport': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'office': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'marketing': return 'bg-pink-500/10 text-pink-700 border-pink-500/20';
      case 'maintenance': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'pending': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'approved': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'paid': return 'bg-green-500/10 text-green-700 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isArabic ? 'تفاصيل المصروف' : 'Expense Details'}</span>
            <div className="flex gap-2">
              <Badge className={getCategoryColor(expense.category)}>
                {getCategoryText(expense.category)}
              </Badge>
              <Badge className={getStatusColor(expense.status)}>
                {getStatusText(expense.status)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{expense.expenseNumber}</CardTitle>
              <p className="text-lg text-muted-foreground">{expense.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <DollarSign className="w-6 h-6" />
                {expense.amount.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'التاريخ' : 'Date'}
                  </span>
                </div>
                <p className="font-semibold">{expense.date}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'طريقة الدفع' : 'Payment Method'}
                  </span>
                </div>
                <p className="font-semibold">{getPaymentMethodText(expense.paymentMethod)}</p>
              </CardContent>
            </Card>

            {expense.vendor && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {isArabic ? 'المورد' : 'Vendor'}
                    </span>
                  </div>
                  <p className="font-semibold">{expense.vendor}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'الإيصال' : 'Receipt'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {expense.receiptAttached ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        {isArabic ? 'مرفق' : 'Attached'}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {isArabic ? 'غير مرفق' : 'Not Attached'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {expense.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-4 h-4" />
                  {isArabic ? 'ملاحظات' : 'Notes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{expense.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Receipt Preview */}
          {expense.receiptAttached && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="w-4 h-4" />
                  {isArabic ? 'الإيصال المرفق' : 'Attached Receipt'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {isArabic ? 'معاينة الإيصال غير متوفرة' : 'Receipt preview not available'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isArabic ? 'انقر لتنزيل أو عرض الإيصال' : 'Click to download or view receipt'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
            {onEdit && (
              <Button onClick={() => {
                onEdit(expense);
                onOpenChange(false);
              }}>
                {isArabic ? 'تعديل المصروف' : 'Edit Expense'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}