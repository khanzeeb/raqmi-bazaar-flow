import { useMemo, useState, useEffect, useCallback } from 'react';
import { Customer, CustomerStats } from '@/types/customer.types';
import { customerGateway } from '../services/customer.gateway';

// Client-side stats calculation from loaded customers
export const useCustomersStats = (customers: Customer[]): CustomerStats => {
  return useMemo(() => ({
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    businessCustomers: customers.filter(c => c.customerType === 'business').length,
    totalCredit: customers.filter(c => c.balance > 0).reduce((sum, c) => sum + c.balance, 0),
    totalDue: customers.filter(c => c.balance < 0).reduce((sum, c) => sum + Math.abs(c.balance), 0)
  }), [customers]);
};

// Server-side stats fetching hook
export const useCustomersStatsFromServer = () => {
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    businessCustomers: 0,
    totalCredit: 0,
    totalDue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await customerGateway.getStats();
      
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
