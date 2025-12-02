// useExpensesActions - CRUD operations
import { useCallback } from 'react';
import { Expense } from '@/types/expense.types';
import { useToast } from '@/hooks/use-toast';

interface UseExpensesActionsOptions {
  onSuccess?: () => void;
  updateStore: (updater: (prev: Expense[]) => Expense[]) => void;
  isArabic?: boolean;
}

export const useExpensesActions = (options: UseExpensesActionsOptions) => {
  const { toast } = useToast();
  const { onSuccess, updateStore, isArabic = false } = options;

  const create = useCallback(async (data: Omit<Expense, 'id'>): Promise<boolean> => {
    const newExpense: Expense = { ...data, id: Math.random().toString(36).substr(2, 9) };
    updateStore(prev => [newExpense, ...prev]);
    toast({ 
      title: isArabic ? 'تم الحفظ' : 'Success', 
      description: isArabic ? 'تم إضافة المصروف بنجاح' : 'Expense added successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const update = useCallback(async (id: string, data: Partial<Expense>): Promise<boolean> => {
    updateStore(prev => prev.map(exp => exp.id === id ? { ...exp, ...data } : exp));
    toast({ 
      title: isArabic ? 'تم التحديث' : 'Success', 
      description: isArabic ? 'تم تحديث المصروف بنجاح' : 'Expense updated successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.filter(exp => exp.id !== id));
    toast({ 
      title: isArabic ? 'تم الحذف' : 'Success', 
      description: isArabic ? 'تم حذف المصروف' : 'Expense deleted' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const approvePayment = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: 'paid' as const } : exp
    ));
    toast({
      title: isArabic ? 'تم اعتماد الدفع' : 'Payment Approved',
      description: isArabic ? 'تم اعتماد الدفع بنجاح' : 'Payment has been approved successfully',
    });
    return true;
  }, [toast, updateStore, isArabic]);

  const attachReceipt = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.map(exp => 
      exp.id === id ? { ...exp, receiptAttached: true } : exp
    ));
    toast({
      title: isArabic ? 'تم إرفاق الإيصال' : 'Receipt Attached',
      description: isArabic ? 'تم إرفاق الإيصال بنجاح' : 'Receipt has been attached successfully',
    });
    return true;
  }, [toast, updateStore, isArabic]);

  return { create, update, remove, approvePayment, attachReceipt };
};
