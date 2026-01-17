import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/types/customer.types';
import { customerGateway } from '../services/customer.gateway';
import { toast } from 'sonner';

export const useCustomersData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await customerGateway.getAll({ limit: 1000 });
      
      if (response.success && response.data) {
        setCustomers(response.data.data);
      } else {
        setError(response.error || 'Failed to fetch customers');
        toast.error(response.error || 'Failed to fetch customers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const refetch = useCallback(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { 
    customers, 
    setCustomers, 
    isLoading, 
    error, 
    refetch 
  };
};
