// usePurchasesStats - Computed statistics
import { useMemo } from 'react';
import { Purchase, PurchaseStats } from '@/types/purchase.types';

export const usePurchasesStats = (purchases: Purchase[]): PurchaseStats => {
  return useMemo(() => ({
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pending').length,
    received: purchases.filter(p => p.status === 'received').length,
    totalValue: purchases.reduce((sum, p) => sum + p.total, 0),
    unpaidValue: purchases.reduce((sum, p) => sum + p.remainingAmount, 0),
  }), [purchases]);
};
