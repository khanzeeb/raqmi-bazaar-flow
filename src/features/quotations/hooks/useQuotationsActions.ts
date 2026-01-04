// useQuotationsActions - CRUD operations with API integration
import { useCallback } from 'react';
import { Quotation, CreateQuotationDTO } from '@/types/quotation.types';
import { useToast } from '@/hooks/use-toast';
import { quotationGateway } from '@/services/quotation.gateway';

interface UseQuotationsActionsOptions {
  onSuccess?: () => void;
  updateStore: (updater: (prev: Quotation[]) => Quotation[]) => void;
  isArabic?: boolean;
}

export const useQuotationsActions = (options: UseQuotationsActionsOptions) => {
  const { toast } = useToast();
  const { onSuccess, updateStore, isArabic = false } = options;

  const create = useCallback(async (data: Omit<Quotation, 'id' | 'createdAt'>): Promise<boolean> => {
    // Transform to DTO format
    const createData: CreateQuotationDTO = {
      quotationNumber: data.quotationNumber,
      customer: data.customer,
      items: data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      taxRate: data.taxRate,
      discount: data.discount,
      validityDays: data.validityDays,
      notes: data.notes
    };

    const response = await quotationGateway.create(createData);
    
    if (response.success && response.data) {
      updateStore(prev => [response.data!, ...prev]);
      toast({ 
        title: isArabic ? 'تم الحفظ' : 'Success', 
        description: isArabic ? 'تم حفظ عرض السعر بنجاح' : 'Quotation saved successfully' 
      });
      onSuccess?.();
      return true;
    } else {
      toast({ 
        title: isArabic ? 'خطأ' : 'Error', 
        description: response.error || (isArabic ? 'فشل في حفظ عرض السعر' : 'Failed to save quotation'),
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, onSuccess, updateStore, isArabic]);

  const update = useCallback(async (id: string, data: Partial<Quotation>): Promise<boolean> => {
    const response = await quotationGateway.update(id, data as any);
    
    if (response.success && response.data) {
      updateStore(prev => prev.map(q => q.id === id ? response.data! : q));
      toast({ 
        title: isArabic ? 'تم التحديث' : 'Success', 
        description: isArabic ? 'تم تحديث عرض السعر بنجاح' : 'Quotation updated successfully' 
      });
      onSuccess?.();
      return true;
    } else {
      toast({ 
        title: isArabic ? 'خطأ' : 'Error', 
        description: response.error || (isArabic ? 'فشل في تحديث عرض السعر' : 'Failed to update quotation'),
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, onSuccess, updateStore, isArabic]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    const response = await quotationGateway.delete(id);
    
    if (response.success) {
      updateStore(prev => prev.filter(q => q.id !== id));
      toast({ 
        title: isArabic ? 'تم الحذف' : 'Success', 
        description: isArabic ? 'تم حذف عرض السعر' : 'Quotation deleted' 
      });
      onSuccess?.();
      return true;
    } else {
      toast({ 
        title: isArabic ? 'خطأ' : 'Error', 
        description: response.error || (isArabic ? 'فشل في حذف عرض السعر' : 'Failed to delete quotation'),
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, onSuccess, updateStore, isArabic]);

  const send = useCallback(async (id: string): Promise<boolean> => {
    const response = await quotationGateway.send(id);
    
    if (response.success && response.data) {
      updateStore(prev => prev.map(q => q.id === id ? response.data! : q));
      toast({
        title: isArabic ? 'تم إرسال العرض' : 'Quotation sent',
        description: isArabic ? 'تم إرسال عرض السعر بنجاح' : 'Quotation has been sent successfully',
      });
      return true;
    } else {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: response.error || (isArabic ? 'فشل في إرسال عرض السعر' : 'Failed to send quotation'),
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, updateStore, isArabic]);

  const accept = useCallback(async (id: string): Promise<boolean> => {
    const response = await quotationGateway.accept(id);
    
    if (response.success && response.data) {
      updateStore(prev => prev.map(q => q.id === id ? response.data! : q));
      toast({
        title: isArabic ? 'تم قبول العرض' : 'Quotation accepted',
        description: isArabic ? 'تم قبول عرض السعر بنجاح' : 'Quotation has been accepted successfully',
      });
      return true;
    } else {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: response.error || (isArabic ? 'فشل في قبول عرض السعر' : 'Failed to accept quotation'),
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, updateStore, isArabic]);

  const decline = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    const response = await quotationGateway.decline(id, reason);
    
    if (response.success && response.data) {
      updateStore(prev => prev.map(q => q.id === id ? response.data! : q));
      toast({
        title: isArabic ? 'تم رفض العرض' : 'Quotation declined',
        description: isArabic ? 'تم رفض عرض السعر' : 'Quotation has been declined',
      });
      return true;
    } else {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: response.error || (isArabic ? 'فشل في رفض عرض السعر' : 'Failed to decline quotation'),
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, updateStore, isArabic]);

  const convertToSale = useCallback(async (id: string): Promise<{ success: boolean; saleOrderId?: string }> => {
    const response = await quotationGateway.convertToSale(id);
    
    if (response.success && response.data) {
      updateStore(prev => prev.map(q => q.id === id ? response.data!.quotation : q));
      toast({
        title: isArabic ? 'تم التحويل' : 'Converted to Sale',
        description: isArabic 
          ? `تم التحويل إلى طلب بيع رقم: ${response.data.saleOrderId}` 
          : `Converted to sales order: ${response.data.saleOrderId}`,
      });
      return { success: true, saleOrderId: response.data.saleOrderId };
    } else {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: response.error || (isArabic ? 'فشل في تحويل عرض السعر' : 'Failed to convert quotation'),
        variant: 'destructive'
      });
      return { success: false };
    }
  }, [toast, updateStore, isArabic]);

  return { create, update, remove, send, accept, decline, convertToSale };
};
