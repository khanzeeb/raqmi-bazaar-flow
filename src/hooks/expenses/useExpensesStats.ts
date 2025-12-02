// useExpensesStats - Computed statistics
import { useMemo } from 'react';
import { Expense, ExpenseStats } from '@/types/expense.types';

export const useExpensesStats = (expenses: Expense[]): ExpenseStats => {
  return useMemo(() => ({
    totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    pending: expenses.filter(exp => exp.status === 'pending').length,
    paid: expenses.filter(exp => exp.status === 'paid').length,
    withReceipts: expenses.filter(exp => exp.receiptAttached).length,
  }), [expenses]);
};
