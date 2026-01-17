// useSalesOrdersStats - Statistics with backend integration
import { useState, useEffect, useCallback } from 'react';
import { SalesOrder, SalesOrderStats } from '@/types/salesOrder.types';
import { salesOrderGateway } from '@/features/sales/services/salesOrder.gateway';

// Client-side stats calculation from orders
export const useSalesOrdersStats = (orders: SalesOrder[]): SalesOrderStats => {
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
  };
};

// Server-side stats hook
export const useSalesOrdersStatsFromServer = () => {
  const [stats, setStats] = useState<SalesOrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await salesOrderGateway.getStats();

    if (response.success && response.data) {
      setStats(response.data);
    } else {
      setError(response.error || 'Failed to fetch stats');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};
