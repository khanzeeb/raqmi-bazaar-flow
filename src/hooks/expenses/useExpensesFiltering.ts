// useExpensesFiltering - Filtering logic
import { useState, useCallback, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense.types';

interface LocalFilters {
  category: 'all' | ExpenseCategory;
}

export const useExpensesFiltering = (expenses: Expense[]) => {
  const [search, setSearch] = useState('');
  const [localFilters, setLocalFilters] = useState<LocalFilters>({ category: 'all' });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = 
        expense.expenseNumber.toLowerCase().includes(search.toLowerCase()) ||
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = localFilters.category === 'all' || expense.category === localFilters.category;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, localFilters]);

  const updateSearch = useCallback((value: string) => setSearch(value), []);

  const updateLocalFilters = useCallback((key: keyof LocalFilters, value: 'all' | ExpenseCategory) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return { search, localFilters, filteredExpenses, updateSearch, updateLocalFilters };
};
