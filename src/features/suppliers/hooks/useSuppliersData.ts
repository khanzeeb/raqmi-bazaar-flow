import { useState, useEffect, useCallback } from 'react';
import { Supplier } from '@/types/supplier.types';
import { supplierGateway } from '../services/supplier.gateway';
import { showToast } from '@/lib/toast';

export const useSuppliersData = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await supplierGateway.getAll({ limit: 1000 });
      if (response.success && response.data) {
        setSuppliers(response.data.data);
      } else {
        setError(response.error || 'Failed to fetch suppliers');
        showToast.error(response.error || 'Failed to fetch suppliers');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch suppliers';
      setError(msg);
      showToast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  return { suppliers, setSuppliers, isLoading, error, refetch: fetchSuppliers };
};
