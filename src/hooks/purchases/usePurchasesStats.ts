// usePurchasesStats - Computed statistics (client-side and server-side)
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Purchase, PurchaseStats } from '@/types/purchase.types';
import { purchaseGateway } from '@/features/purchases/services/purchase.gateway';

// Client-side stats calculation from loaded purchases
export const usePurchasesStats = (purchases: Purchase[]): PurchaseStats => {
  return useMemo(() => ({
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pending').length,
    received: purchases.filter(p => p.status === 'received').length,
    totalValue: purchases.reduce((sum, p) => sum + p.total, 0),
    unpaidValue: purchases.reduce((sum, p) => sum + p.remainingAmount, 0),
  }), [purchases]);
};

// Server-side stats fetching
export const usePurchasesStatsFromServer = () => {
  const [stats, setStats] = useState<PurchaseStats>({
    total: 0,
    pending: 0,
    received: 0,
    totalValue: 0,
    unpaidValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await purchaseGateway.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};
