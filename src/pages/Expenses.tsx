// Expenses Page - Refactored with separated hooks
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Receipt, Car, Home, Zap, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExpenseDialog } from "@/components/Expenses/ExpenseDialog";
import { ExpenseDetailsDialog } from "@/components/Expenses/ExpenseDetailsDialog";
import { useExpensesData, useExpensesFiltering, useExpensesActions, useExpensesStats } from '@/hooks/expenses';
import { Expense, ExpenseCategory, ExpenseStatus } from '@/types/expense.types';
import { BilingualLabel } from "@/components/common/BilingualLabel";

const Expenses = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Data hook
  const { expenses, loading, updateStore, refresh } = useExpensesData();

  // Filtering hook
  const { search, localFilters, filteredExpenses, updateSearch, updateLocalFilters } = useExpensesFiltering(expenses);

  // Actions hook
  const { create, update, remove, approvePayment, attachReceipt } = useExpensesActions({ 
    updateStore, isArabic, onSuccess: refresh 
  });

  // Stats hook
  const stats = useExpensesStats(expenses);

  // Local UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);

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

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (selectedExpense) {
      update(selectedExpense.id, expenseData);
    } else {
      create(expenseData);
    }
    setIsDialogOpen(false);
    setSelectedExpense(undefined);
  };

  const currencySymbol = isArabic ? 'ر.س' : 'SAR';

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <BilingualLabel enLabel="Expenses" arLabel="المصروفات" showBoth={false} />
        </h1>
        <p className="text-muted-foreground">
          <BilingualLabel enLabel="Manage expenses and payments" arLabel="إدارة المصروفات والدفعات" showBoth={false} />
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.totalExpenses.toLocaleString()} {currencySymbol}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Total Expenses" arLabel="إجمالي المصروفات" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Pending" arLabel="معلقة" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="Paid" arLabel="مدفوعة" showBoth={false} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.withReceipts}</div>
            <p className="text-sm text-muted-foreground"><BilingualLabel enLabel="With Receipts" arLabel="بإيصالات" showBoth={false} /></p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 ${isArabic ? 'right-3' : 'left-3'}`} />
          <Input
            placeholder={isArabic ? "البحث برقم المصروف أو الوصف..." : "Search by expense number or description..."}
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            className={isArabic ? "pr-10" : "pl-10"}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={localFilters.category}
            onChange={(e) => updateLocalFilters('category', e.target.value as 'all' | ExpenseCategory)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</option>
            <option value="rent">{isArabic ? 'إيجار' : 'Rent'}</option>
            <option value="utilities">{isArabic ? 'مرافق' : 'Utilities'}</option>
            <option value="transport">{isArabic ? 'مواصلات' : 'Transport'}</option>
            <option value="office">{isArabic ? 'مكتب' : 'Office'}</option>
            <option value="marketing">{isArabic ? 'تسويق' : 'Marketing'}</option>
            <option value="maintenance">{isArabic ? 'صيانة' : 'Maintenance'}</option>
            <option value="other">{isArabic ? 'أخرى' : 'Other'}</option>
          </select>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          <Button onClick={() => { setSelectedExpense(undefined); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            <BilingualLabel enLabel="New Expense" arLabel="مصروف جديد" showBoth={false} />
          </Button>
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="grid gap-4">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="hover:shadow-md transition-shadow">
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
                <Button variant="outline" size="sm" onClick={() => { setSelectedExpense(expense); setIsDetailsDialogOpen(true); }}>
                  {isArabic ? 'عرض التفاصيل' : 'View Details'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedExpense(expense); setIsDialogOpen(true); }}>
                  {isArabic ? 'تعديل' : 'Edit'}
                </Button>
                {!expense.receiptAttached && (
                  <Button variant="outline" size="sm" onClick={() => attachReceipt(expense.id)}>
                    {isArabic ? 'إرفاق إيصال' : 'Attach Receipt'}
                  </Button>
                )}
                {expense.status === 'pending' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approvePayment(expense.id)}>
                    {isArabic ? 'اعتماد الدفع' : 'Approve Payment'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{isArabic ? 'لا توجد مصروفات مطابقة للبحث' : 'No expenses found matching your search'}</p>
        </div>
      )}

      {/* Dialogs */}
      <ExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expense={selectedExpense}
        onSave={handleSaveExpense}
      />
      <ExpenseDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        expense={selectedExpense}
        onEdit={(exp) => { setSelectedExpense(exp); setIsDetailsDialogOpen(false); setIsDialogOpen(true); }}
      />
    </div>
  );
};

export default Expenses;
