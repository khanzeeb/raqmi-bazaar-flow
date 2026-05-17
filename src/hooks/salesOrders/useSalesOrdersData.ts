// useSalesOrdersData - Static data source
import { useState, useCallback } from 'react';
import { SalesOrder } from '@/types/salesOrder.types';
import { STATIC_SALES_ORDERS } from './staticSalesOrders';

interface UseSalesOrdersDataOptions {
  initialLimit?: number;
  autoFetch?: boolean;
}

export const useSalesOrdersData = (options: UseSalesOrdersDataOptions = {}) => {
  const { initialLimit = 50 } = options;

  const [orders, setOrders] = useState<SalesOrder[]>(STATIC_SALES_ORDERS);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [pagination] = useState({
    total: STATIC_SALES_ORDERS.length,
    page: 1,
    limit: initialLimit,
    totalPages: 1,
  });

  const refresh = useCallback(async () => {
    setOrders(STATIC_SALES_ORDERS);
  }, []);

  const updateStore = useCallback((updater: (prev: SalesOrder[]) => SalesOrder[]) => {
    setOrders(prev => updater(prev));
  }, []);

  return {
    orders,
    setOrders,
    loading,
    error,
    pagination,
    refresh,
    updateStore,
  };
};
