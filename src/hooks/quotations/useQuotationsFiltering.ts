// useQuotationsFiltering - Filtering logic
import { useState, useCallback, useMemo } from 'react';
import { Quotation, QuotationStatus } from '@/types/quotation.types';

interface LocalFilters {
  status: 'all' | QuotationStatus;
}

export const useQuotationsFiltering = (quotations: Quotation[]) => {
  const [search, setSearch] = useState('');
  const [localFilters, setLocalFilters] = useState<LocalFilters>({ status: 'all' });

  const filteredQuotations = useMemo(() => {
    return quotations.filter(quotation => {
      const matchesSearch = 
        quotation.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
        quotation.customer.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = localFilters.status === 'all' || quotation.status === localFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, localFilters]);

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const updateLocalFilters = useCallback((key: keyof LocalFilters, value: 'all' | QuotationStatus) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    search,
    localFilters,
    filteredQuotations,
    updateSearch,
    updateLocalFilters,
  };
};
