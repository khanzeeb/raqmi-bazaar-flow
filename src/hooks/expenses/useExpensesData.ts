// useExpensesData - Data fetching and state management
import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/types/expense.types';

interface UseExpensesDataOptions {
  autoFetch?: boolean;
}

const DUMMY_EXPENSES: Expense[] = [
  {
    id: '1',
    expenseNumber: 'EXP-001',
    category: 'rent',
    description: 'إيجار المحل - شهر يناير',
    amount: 5000,
    paymentMethod: 'bank_transfer',
    date: '2024-01-01',
    vendor: 'شركة العقارات المتحدة',
    receiptAttached: true,
    status: 'paid',
    notes: 'تم الدفع في المعاد المحدد'
  },
  {
    id: '2',
    expenseNumber: 'EXP-002',
    category: 'utilities',
    description: 'فاتورة الكهرباء',
    amount: 450,
    paymentMethod: 'card',
    date: '2024-01-15',
    vendor: 'الشركة السعودية للكهرباء',
    receiptAttached: true,
    status: 'paid'
  },
  {
    id: '3',
    expenseNumber: 'EXP-003',
    category: 'transport',
    description: 'وقود السيارات',
    amount: 300,
    paymentMethod: 'cash',
    date: '2024-01-16',
    receiptAttached: false,
    status: 'pending'
  },
  {
    id: '4',
    expenseNumber: 'EXP-004',
    category: 'office',
    description: 'مستلزمات مكتبية',
    amount: 150,
    paymentMethod: 'cash',
    date: '2024-01-17',
    vendor: 'مكتبة الرياض',
    receiptAttached: true,
    status: 'approved'
  }
];

let expensesStore = [...DUMMY_EXPENSES];

export const useExpensesData = (options: UseExpensesDataOptions = {}) => {
  const { autoFetch = true } = options;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 150));
    setExpenses([...expensesStore]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch]);

  const updateStore = useCallback((updater: (prev: Expense[]) => Expense[]) => {
    expensesStore = updater(expensesStore);
    setExpenses([...expensesStore]);
  }, []);

  return { expenses, loading, error, refresh: fetch, updateStore };
};
