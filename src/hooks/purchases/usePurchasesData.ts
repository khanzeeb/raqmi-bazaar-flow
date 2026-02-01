// usePurchasesData - Data fetching from backend API
import { useState, useEffect, useCallback } from 'react';
import { Purchase } from '@/types/purchase.types';
import { purchaseGateway } from '@/features/purchases/services/purchase.gateway';
import { showToast } from '@/lib/toast';

interface UsePurchasesDataOptions {
  autoFetch?: boolean;
}

export const usePurchasesData = (options: UsePurchasesDataOptions = {}) => {
  const { autoFetch = true } = options;

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await purchaseGateway.getAll({ limit: 1000 });
      
      if (response.success && response.data) {
        setPurchases(response.data.data);
      } else {
        setError(response.error || 'Failed to fetch purchases');
        showToast.error(response.error || 'Failed to fetch purchases');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch purchases';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  const updateStore = useCallback((updater: (prev: Purchase[]) => Purchase[]) => {
    setPurchases(prev => updater(prev));
  }, []);

  return { 
    purchases, 
    loading, 
    error, 
    refresh: fetch, 
    updateStore 
  };
};
