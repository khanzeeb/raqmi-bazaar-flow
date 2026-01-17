// useSalesOrdersData - Data fetching and state management with backend integration
import { useState, useEffect, useCallback } from 'react';
import { SalesOrder } from '@/types/salesOrder.types';
import { salesOrderGateway } from '@/features/sales/services/salesOrder.gateway';
import { useToast } from '@/hooks/use-toast';

interface UseSalesOrdersDataOptions {
  initialLimit?: number;
  autoFetch?: boolean;
}

export const useSalesOrdersData = (options: UseSalesOrdersDataOptions = {}) => {
  const { toast } = useToast();
  const { initialLimit = 50, autoFetch = true } = options;

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: initialLimit,
    totalPages: 0
  });

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    const response = await salesOrderGateway.getAll({ page, limit: initialLimit });

    if (response.success && response.data) {
      setOrders(response.data.data);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages
      });
    } else {
      setError(response.error || 'Failed to fetch orders');
      toast({
        title: 'Error',
        description: response.error || 'Failed to fetch sales orders',
        variant: 'destructive'
      });
    }

    setLoading(false);
  }, [initialLimit, toast]);

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch]);

  const updateStore = useCallback((updater: (prev: SalesOrder[]) => SalesOrder[]) => {
    setOrders(prev => updater(prev));
  }, []);

  return {
    orders,
    setOrders,
    loading,
    error,
    pagination,
    refresh: fetchOrders,
    updateStore
  };
};
