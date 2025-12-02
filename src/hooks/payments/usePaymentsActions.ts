// usePaymentsActions - CRUD operations
import { useCallback } from 'react';
import { Payment, CustomerCredit } from '@/types/payment.types';
import { useToast } from '@/hooks/use-toast';

interface UsePaymentsActionsOptions {
  onSuccess?: () => void;
  updatePaymentsStore: (updater: (prev: Payment[]) => Payment[]) => void;
  updateCreditsStore: (updater: (prev: CustomerCredit[]) => CustomerCredit[]) => void;
  isArabic?: boolean;
}

export const usePaymentsActions = (options: UsePaymentsActionsOptions) => {
  const { toast } = useToast();
  const { onSuccess, updatePaymentsStore, updateCreditsStore, isArabic = false } = options;

  const create = useCallback(async (data: Partial<Payment>): Promise<boolean> => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...data
    } as Payment;
    updatePaymentsStore(prev => [newPayment, ...prev]);
    toast({ 
      title: isArabic ? 'تم الحفظ' : 'Success', 
      description: isArabic ? 'تم حفظ الدفعة بنجاح' : 'Payment saved successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updatePaymentsStore, isArabic]);

  const update = useCallback(async (id: string, data: Partial<Payment>): Promise<boolean> => {
    updatePaymentsStore(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    toast({ 
      title: isArabic ? 'تم التحديث' : 'Success', 
      description: isArabic ? 'تم تحديث الدفعة بنجاح' : 'Payment updated successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updatePaymentsStore, isArabic]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    updatePaymentsStore(prev => prev.filter(p => p.id !== id));
    toast({ 
      title: isArabic ? 'تم الحذف' : 'Success', 
      description: isArabic ? 'تم حذف الدفعة' : 'Payment deleted' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updatePaymentsStore, isArabic]);

  const updateCustomerCredit = useCallback(async (creditData: Partial<CustomerCredit>): Promise<boolean> => {
    updateCreditsStore(prev => {
      const existingIndex = prev.findIndex(c => c.customerId === creditData.customerId);
      if (existingIndex >= 0) {
        return prev.map((credit, index) => 
          index === existingIndex ? { ...credit, ...creditData } : credit
        );
      }
      return [...prev, creditData as CustomerCredit];
    });
    toast({
      title: isArabic ? 'تم تحديث الائتمان' : 'Credit updated',
      description: isArabic ? 'تم تحديث إعدادات الائتمان بنجاح' : 'Credit settings have been updated successfully',
    });
    return true;
  }, [toast, updateCreditsStore, isArabic]);

  return { create, update, remove, updateCustomerCredit };
};
