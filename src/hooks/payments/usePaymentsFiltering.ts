// usePaymentsFiltering - Filtering logic
import { useState, useCallback, useMemo } from 'react';
import { Payment, PaymentStatus } from '@/types/payment.types';

interface LocalFilters {
  status: 'all' | PaymentStatus;
}

export const usePaymentsFiltering = (payments: Payment[]) => {
  const [search, setSearch] = useState('');
  const [localFilters, setLocalFilters] = useState<LocalFilters>({ status: 'all' });

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = 
        payment.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(search.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = localFilters.status === 'all' || payment.status === localFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, localFilters]);

  const updateSearch = useCallback((value: string) => setSearch(value), []);

  const updateLocalFilters = useCallback((key: keyof LocalFilters, value: 'all' | PaymentStatus) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return { search, localFilters, filteredPayments, updateSearch, updateLocalFilters };
};
