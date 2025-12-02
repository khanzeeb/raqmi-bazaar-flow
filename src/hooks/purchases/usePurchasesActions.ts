// usePurchasesActions - CRUD operations
import { useCallback } from 'react';
import { Purchase, PurchasePaymentHistory } from '@/types/purchase.types';
import { useToast } from '@/hooks/use-toast';

interface UsePurchasesActionsOptions {
  onSuccess?: () => void;
  updateStore: (updater: (prev: Purchase[]) => Purchase[]) => void;
  isArabic?: boolean;
}

export const usePurchasesActions = (options: UsePurchasesActionsOptions) => {
  const { toast } = useToast();
  const { onSuccess, updateStore, isArabic = false } = options;

  const create = useCallback(async (data: Partial<Purchase>): Promise<boolean> => {
    const newPurchase: Purchase = { ...data, id: Date.now().toString() } as Purchase;
    updateStore(prev => [newPurchase, ...prev]);
    toast({ 
      title: isArabic ? 'تم الحفظ' : 'Success', 
      description: isArabic ? 'تم حفظ طلب الشراء بنجاح' : 'Purchase order saved successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const update = useCallback(async (id: string, data: Partial<Purchase>): Promise<boolean> => {
    updateStore(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    toast({ 
      title: isArabic ? 'تم التحديث' : 'Success', 
      description: isArabic ? 'تم تحديث طلب الشراء' : 'Purchase order updated' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.filter(p => p.id !== id));
    toast({ 
      title: isArabic ? 'تم الحذف' : 'Success', 
      description: isArabic ? 'تم حذف طلب الشراء' : 'Purchase order deleted' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const markReceived = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'received' as const, receivedDate: new Date().toISOString().split('T')[0] } : p
    ));
    toast({
      title: isArabic ? 'تم الاستلام' : 'Received',
      description: isArabic ? 'تم تسجيل استلام الطلب' : 'Order marked as received',
    });
    return true;
  }, [toast, updateStore, isArabic]);

  const addPayment = useCallback(async (id: string, paymentData: Omit<PurchasePaymentHistory, 'id'>): Promise<boolean> => {
    const newPayment: PurchasePaymentHistory = { id: Date.now().toString(), ...paymentData };
    updateStore(prev => prev.map(p => {
      if (p.id === id) {
        const newPaidAmount = p.paidAmount + paymentData.amount;
        const newRemainingAmount = p.total - newPaidAmount;
        const newPaymentStatus = newRemainingAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'unpaid';
        return {
          ...p,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
          paymentHistory: [...p.paymentHistory, newPayment]
        };
      }
      return p;
    }));
    toast({
      title: isArabic ? 'تم إضافة الدفعة' : 'Payment added',
      description: isArabic ? 'تم إضافة الدفعة بنجاح' : 'Payment added successfully',
    });
    return true;
  }, [toast, updateStore, isArabic]);

  const addToInventory = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.map(p => 
      p.id === id ? { ...p, addedToInventory: true } : p
    ));
    toast({
      title: isArabic ? 'تمت الإضافة للمخزون' : 'Added to inventory',
      description: isArabic ? 'تم إضافة العناصر للمخزون بنجاح' : 'Items added to inventory successfully',
    });
    return true;
  }, [toast, updateStore, isArabic]);

  return { create, update, remove, markReceived, addPayment, addToInventory };
};
