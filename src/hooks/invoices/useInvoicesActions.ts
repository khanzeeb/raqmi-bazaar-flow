// useInvoicesActions - CRUD operations
import { useCallback } from 'react';
import { Invoice } from '@/types/invoice.types';
import { useToast } from '@/hooks/use-toast';

interface UseInvoicesActionsOptions {
  onSuccess?: () => void;
  updateStore: (updater: (prev: Invoice[]) => Invoice[]) => void;
  isArabic?: boolean;
}

export const useInvoicesActions = (options: UseInvoicesActionsOptions) => {
  const { toast } = useToast();
  const { onSuccess, updateStore, isArabic = false } = options;

  const create = useCallback(async (data: Omit<Invoice, 'id'>): Promise<boolean> => {
    const newInvoice: Invoice = { ...data, id: Date.now().toString() };
    updateStore(prev => [newInvoice, ...prev]);
    toast({ 
      title: isArabic ? 'تم الحفظ' : 'Success', 
      description: isArabic ? 'تم حفظ الفاتورة بنجاح' : 'Invoice saved successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const update = useCallback(async (id: string, data: Partial<Invoice>): Promise<boolean> => {
    updateStore(prev => prev.map(inv => inv.id === id ? { ...inv, ...data } : inv));
    toast({ 
      title: isArabic ? 'تم التحديث' : 'Success', 
      description: isArabic ? 'تم تحديث الفاتورة بنجاح' : 'Invoice updated successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.filter(inv => inv.id !== id));
    toast({ 
      title: isArabic ? 'تم الحذف' : 'Success', 
      description: isArabic ? 'تم حذف الفاتورة' : 'Invoice deleted' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const markAsPaid = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: 'paid' as const } : inv
    ));
    toast({
      title: isArabic ? 'تم تحديث الحالة' : 'Status updated',
      description: isArabic ? 'تم تعليم الفاتورة كمدفوعة' : 'Invoice marked as paid',
    });
    return true;
  }, [toast, updateStore, isArabic]);

  return { create, update, remove, markAsPaid };
};
