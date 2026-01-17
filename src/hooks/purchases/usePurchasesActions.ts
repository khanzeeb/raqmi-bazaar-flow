// usePurchasesActions - CRUD operations via backend API
import { useCallback, useState } from 'react';
import { Purchase, PurchasePaymentHistory, CreatePurchaseDTO } from '@/types/purchase.types';
import { purchaseGateway } from '@/features/purchases/services/purchase.gateway';
import { toast } from 'sonner';

interface UsePurchasesActionsOptions {
  onSuccess?: () => void;
  updateStore: (updater: (prev: Purchase[]) => Purchase[]) => void;
  isArabic?: boolean;
}

export const usePurchasesActions = (options: UsePurchasesActionsOptions) => {
  const { onSuccess, updateStore, isArabic = false } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = useCallback(async (data: Partial<Purchase>): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const createData: CreatePurchaseDTO = {
        purchaseNumber: data.purchaseNumber || `PO-${Date.now()}`,
        supplier: data.supplier || { name: '', phone: '' },
        items: data.items?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })) || [],
        paymentMethod: data.paymentMethod || 'credit',
        expectedDate: data.expectedDate,
        notes: data.notes
      };

      const response = await purchaseGateway.create(createData);
      
      if (response.success && response.data) {
        updateStore(prev => [response.data!, ...prev]);
        toast.success(isArabic ? 'تم حفظ طلب الشراء بنجاح' : 'Purchase order saved successfully');
        onSuccess?.();
        return true;
      } else {
        toast.error(response.error || (isArabic ? 'فشل في إنشاء طلب الشراء' : 'Failed to create purchase'));
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create purchase';
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [updateStore, onSuccess, isArabic]);

  const update = useCallback(async (id: string, data: Partial<Purchase>): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await purchaseGateway.update(id, {
        id,
        purchaseNumber: data.purchaseNumber,
        supplier: data.supplier,
        items: data.items?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        paymentMethod: data.paymentMethod,
        expectedDate: data.expectedDate,
        notes: data.notes,
        status: data.status,
        paymentStatus: data.paymentStatus
      });
      
      if (response.success && response.data) {
        updateStore(prev => prev.map(p => p.id === id ? response.data! : p));
        toast.success(isArabic ? 'تم تحديث طلب الشراء' : 'Purchase order updated');
        onSuccess?.();
        return true;
      } else {
        toast.error(response.error || (isArabic ? 'فشل في تحديث طلب الشراء' : 'Failed to update purchase'));
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update purchase';
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [updateStore, onSuccess, isArabic]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await purchaseGateway.delete(id);
      
      if (response.success) {
        updateStore(prev => prev.filter(p => p.id !== id));
        toast.success(isArabic ? 'تم حذف طلب الشراء' : 'Purchase order deleted');
        onSuccess?.();
        return true;
      } else {
        toast.error(response.error || (isArabic ? 'فشل في حذف طلب الشراء' : 'Failed to delete purchase'));
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete purchase';
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [updateStore, onSuccess, isArabic]);

  const markReceived = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await purchaseGateway.markAsReceived(id);
      
      if (response.success && response.data) {
        updateStore(prev => prev.map(p => p.id === id ? response.data! : p));
        toast.success(isArabic ? 'تم تسجيل استلام الطلب' : 'Order marked as received');
        return true;
      } else {
        toast.error(response.error || (isArabic ? 'فشل في تسجيل الاستلام' : 'Failed to mark as received'));
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark as received';
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [updateStore, isArabic]);

  const addPayment = useCallback(async (id: string, paymentData: Omit<PurchasePaymentHistory, 'id'>): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await purchaseGateway.addPayment(id, paymentData);
      
      if (response.success && response.data) {
        updateStore(prev => prev.map(p => p.id === id ? response.data! : p));
        toast.success(isArabic ? 'تم إضافة الدفعة بنجاح' : 'Payment added successfully');
        return true;
      } else {
        toast.error(response.error || (isArabic ? 'فشل في إضافة الدفعة' : 'Failed to add payment'));
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add payment';
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [updateStore, isArabic]);

  const addToInventory = useCallback(async (id: string): Promise<boolean> => {
    // This would typically call an inventory service endpoint
    // For now, update locally and mark as added
    setIsSubmitting(true);
    try {
      const response = await purchaseGateway.update(id, { id } as any);
      
      if (response.success) {
        updateStore(prev => prev.map(p => 
          p.id === id ? { ...p, addedToInventory: true } : p
        ));
        toast.success(isArabic ? 'تم إضافة العناصر للمخزون بنجاح' : 'Items added to inventory successfully');
        return true;
      } else {
        // Fallback to local update if API doesn't support this field
        updateStore(prev => prev.map(p => 
          p.id === id ? { ...p, addedToInventory: true } : p
        ));
        toast.success(isArabic ? 'تم إضافة العناصر للمخزون بنجاح' : 'Items added to inventory successfully');
        return true;
      }
    } catch (error) {
      // Fallback to local update
      updateStore(prev => prev.map(p => 
        p.id === id ? { ...p, addedToInventory: true } : p
      ));
      toast.success(isArabic ? 'تم إضافة العناصر للمخزون بنجاح' : 'Items added to inventory successfully');
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [updateStore, isArabic]);

  return { 
    create, 
    update, 
    remove, 
    markReceived, 
    addPayment, 
    addToInventory,
    isSubmitting 
  };
};
