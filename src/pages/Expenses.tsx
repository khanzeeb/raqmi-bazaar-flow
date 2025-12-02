// Expenses Page - Refactored with modular components
import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { ExpenseDialog } from "@/components/Expenses/ExpenseDialog";
import { ExpenseDetailsDialog } from "@/components/Expenses/ExpenseDetailsDialog";
import { ExpenseCard } from "@/components/Expenses/ExpenseCard";
import { ExpenseFilters } from "@/components/Expenses/ExpenseFilters";
import { ExpenseStats } from "@/components/Expenses/ExpenseStats";
import { useExpensesData, useExpensesFiltering, useExpensesActions, useExpensesStats } from '@/hooks/expenses';
import { Expense } from '@/types/expense.types';
import { BilingualLabel } from "@/components/common/BilingualLabel";

const Expenses = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Hooks
  const { expenses, updateStore, refresh } = useExpensesData();
  const { search, localFilters, filteredExpenses, updateSearch, updateLocalFilters } = useExpensesFiltering(expenses);
  const { create, update, approvePayment, attachReceipt } = useExpensesActions({ updateStore, isArabic, onSuccess: refresh });
  const stats = useExpensesStats(expenses);

  // Local UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (selectedExpense) update(selectedExpense.id, expenseData);
    else create(expenseData);
    setIsDialogOpen(false);
    setSelectedExpense(undefined);
  };

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

      <ExpenseStats stats={stats} />

      <ExpenseFilters
        search={search}
        category={localFilters.category}
        onSearchChange={updateSearch}
        onCategoryChange={(value) => updateLocalFilters('category', value)}
        onNewExpense={() => { setSelectedExpense(undefined); setIsDialogOpen(true); }}
      />

      <div className="grid gap-4">
        {filteredExpenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onViewDetails={() => { setSelectedExpense(expense); setIsDetailsDialogOpen(true); }}
            onEdit={() => { setSelectedExpense(expense); setIsDialogOpen(true); }}
            onAttachReceipt={() => attachReceipt(expense.id)}
            onApprovePayment={() => approvePayment(expense.id)}
          />
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{isArabic ? 'لا توجد مصروفات مطابقة للبحث' : 'No expenses found matching your search'}</p>
        </div>
      )}

      {/* Dialogs */}
      <ExpenseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} expense={selectedExpense} onSave={handleSaveExpense} />
      <ExpenseDetailsDialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} expense={selectedExpense} onEdit={(exp) => { setSelectedExpense(exp); setIsDetailsDialogOpen(false); setIsDialogOpen(true); }} />
    </div>
  );
};

export default Expenses;
