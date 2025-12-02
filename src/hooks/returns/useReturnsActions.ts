import { Return } from '@/types/return.types';
import { useToast } from '@/hooks/use-toast';

export const useReturnsActions = (
  returns: Return[],
  setReturns: React.Dispatch<React.SetStateAction<Return[]>>,
  isArabic: boolean
) => {
  const { toast } = useToast();

  const approveReturn = (returnId: number) => {
    setReturns(prev => prev.map(r =>
      r.id === returnId ? { ...r, status: 'approved' as const } : r
    ));
    toast({
      title: isArabic ? "تمت الموافقة" : "Return Approved",
      description: isArabic ? "تمت الموافقة على المرتجع" : "Return has been approved",
    });
  };

  const rejectReturn = (returnId: number) => {
    setReturns(prev => prev.map(r =>
      r.id === returnId ? { ...r, status: 'rejected' as const, refund_status: 'cancelled' as const } : r
    ));
    toast({
      title: isArabic ? "تم الرفض" : "Return Rejected",
      description: isArabic ? "تم رفض المرتجع" : "Return has been rejected",
    });
  };

  const completeReturn = (returnId: number) => {
    setReturns(prev => prev.map(r =>
      r.id === returnId ? { ...r, status: 'completed' as const, refund_status: 'processed' as const } : r
    ));
    toast({
      title: isArabic ? "اكتمل المرتجع" : "Return Completed",
      description: isArabic ? "تم إتمام المرتجع والاسترداد" : "Return and refund have been completed",
    });
  };

  const addReturn = (returnData: Omit<Return, 'id'>) => {
    const newReturn: Return = {
      ...returnData,
      id: Date.now()
    };
    setReturns(prev => [newReturn, ...prev]);
    toast({
      title: isArabic ? "تم إنشاء المرتجع" : "Return Created",
      description: isArabic ? "تم إنشاء طلب المرتجع بنجاح" : "Return request created successfully",
    });
  };

  return { approveReturn, rejectReturn, completeReturn, addReturn };
};
