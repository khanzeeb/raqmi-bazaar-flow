import { useMemo } from 'react';
import { SalesOrder, SalesOrderStats } from '@/types/salesOrder.types';

export const useSalesOrdersStats = (orders: SalesOrder[]): SalesOrderStats => {
  return useMemo(() => ({
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
  }), [orders]);
};
