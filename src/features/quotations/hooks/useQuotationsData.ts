// useQuotationsData - Data fetching and state management
import { useState, useEffect, useCallback } from 'react';
import { Quotation } from '@/types/quotation.types';
import { useToast } from '@/hooks/use-toast';
import { quotationGateway } from '../services/quotation.gateway';

interface UseQuotationsDataOptions {
  initialLimit?: number;
  autoFetch?: boolean;
}

export const useQuotationsData = (options: UseQuotationsDataOptions = {}) => {
  const { toast } = useToast();
  const { initialLimit = 50, autoFetch = true } = options;

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await quotationGateway.getAll({ limit: initialLimit });
    
    if (response.success && response.data) {
      setQuotations(response.data.data);
    } else {
      setError(response.error || 'Failed to fetch quotations');
      toast({
        title: 'Error',
        description: response.error || 'Failed to fetch quotations',
        variant: 'destructive'
      });
    }
    
    setLoading(false);
  }, [initialLimit, toast]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch]);

  const updateStore = useCallback((updater: (prev: Quotation[]) => Quotation[]) => {
    setQuotations(prev => updater(prev));
  }, []);

  return {
    quotations,
    loading,
    error,
    refresh: fetch,
    updateStore,
  };
};
