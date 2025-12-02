// useQuotationsActions - CRUD operations
import { useCallback } from 'react';
import { Quotation } from '@/types/quotation.types';
import { useToast } from '@/hooks/use-toast';

interface UseQuotationsActionsOptions {
  onSuccess?: () => void;
  updateStore: (updater: (prev: Quotation[]) => Quotation[]) => void;
  isArabic?: boolean;
}

export const useQuotationsActions = (options: UseQuotationsActionsOptions) => {
  const { toast } = useToast();
  const { onSuccess, updateStore, isArabic = false } = options;

  const create = useCallback(async (data: Omit<Quotation, 'id' | 'createdAt'>): Promise<boolean> => {
    const newQuotation: Quotation = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    updateStore(prev => [newQuotation, ...prev]);
    toast({ 
      title: isArabic ? 'تم الحفظ' : 'Success', 
      description: isArabic ? 'تم حفظ عرض السعر بنجاح' : 'Quotation saved successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const update = useCallback(async (id: string, data: Partial<Quotation>): Promise<boolean> => {
    updateStore(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));
    toast({ 
      title: isArabic ? 'تم التحديث' : 'Success', 
      description: isArabic ? 'تم تحديث عرض السعر بنجاح' : 'Quotation updated successfully' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    updateStore(prev => prev.filter(q => q.id !== id));
    toast({ 
      title: isArabic ? 'تم الحذف' : 'Success', 
      description: isArabic ? 'تم حذف عرض السعر' : 'Quotation deleted' 
    });
    onSuccess?.();
    return true;
  }, [toast, onSuccess, updateStore, isArabic]);

  const send = useCallback(async (id: string): Promise<boolean> => {
    const currentTime = new Date().toISOString();
    updateStore(prev => prev.map(q => 
      q.id === id ? { 
        ...q, 
        status: 'sent' as const,
        history: [...q.history, {
          id: Date.now().toString(),
          action: 'sent' as const,
          timestamp: currentTime,
          notes: isArabic ? 'تم الإرسال للعميل' : 'Sent to customer'
        }]
      } : q
    ));
    toast({
      title: isArabic ? 'تم إرسال العرض' : 'Quotation sent',
      description: isArabic ? 'تم إرسال عرض السعر بنجاح' : 'Quotation has been sent successfully',
    });
    return true;
  }, [toast, updateStore, isArabic]);

  const accept = useCallback(async (id: string): Promise<boolean> => {
    const currentTime = new Date().toISOString();
    updateStore(prev => prev.map(q => 
      q.id === id ? { 
        ...q, 
        status: 'accepted' as const,
        history: [...q.history, {
          id: Date.now().toString(),
          action: 'accepted' as const,
          timestamp: currentTime,
          notes: isArabic ? 'تم قبول العرض من قبل العميل' : 'Accepted by customer'
        }]
      } : q
    ));
    toast({
      title: isArabic ? 'تم قبول العرض' : 'Quotation accepted',
      description: isArabic ? 'تم قبول عرض السعر بنجاح' : 'Quotation has been accepted successfully',
    });
    return true;
  }, [toast, updateStore, isArabic]);

  return { create, update, remove, send, accept };
};
