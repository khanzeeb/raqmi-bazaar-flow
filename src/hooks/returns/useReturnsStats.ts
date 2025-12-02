import { useMemo } from 'react';
import { Return, ReturnStats } from '@/types/return.types';

export const useReturnsStats = (returns: Return[]): ReturnStats => {
  return useMemo(() => ({
    totalReturns: returns.length,
    pendingReturns: returns.filter(r => r.status === 'pending').length,
    completedReturns: returns.filter(r => r.status === 'completed').length,
    totalRefundAmount: returns.reduce((sum, r) => sum + r.refund_amount, 0)
  }), [returns]);
};
