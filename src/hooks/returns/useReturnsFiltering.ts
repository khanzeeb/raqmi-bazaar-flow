import { useState, useMemo } from 'react';
import { Return, ReturnFilters } from '@/types/return.types';

export const useReturnsFiltering = (returns: Return[]) => {
  const [filters, setFilters] = useState<ReturnFilters>({
    searchTerm: '',
    statusFilter: 'all'
  });

  const filteredReturns = useMemo(() => {
    return returns.filter(returnItem => {
      const matchesSearch = returnItem.return_number.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        returnItem.customer_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        returnItem.sale_number.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus = filters.statusFilter === 'all' || returnItem.status === filters.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [returns, filters]);

  const setSearchTerm = (term: string) => setFilters(prev => ({ ...prev, searchTerm: term }));
  const setStatusFilter = (status: string) => setFilters(prev => ({ ...prev, statusFilter: status }));

  return { filters, filteredReturns, setSearchTerm, setStatusFilter };
};
