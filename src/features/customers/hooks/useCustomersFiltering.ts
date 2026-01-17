import { useState, useMemo, useCallback } from 'react';
import { Customer, CustomerFilters } from '@/types/customer.types';

export const useCustomersFiltering = (customers: Customer[]) => {
  const [filters, setFilters] = useState<CustomerFilters>({
    searchQuery: '',
    status: 'all',
    type: 'all'
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search filter
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch = !filters.searchQuery || 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.nameAr.includes(filters.searchQuery) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.searchQuery);

      // Status filter
      const matchesStatus = filters.status === 'all' || customer.status === filters.status;

      // Type filter
      const matchesType = filters.type === 'all' || customer.customerType === filters.type;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [customers, filters]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setStatusFilter = useCallback((status: CustomerFilters['status']) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const setTypeFilter = useCallback((type: CustomerFilters['type']) => {
    setFilters(prev => ({ ...prev, type }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      status: 'all',
      type: 'all'
    });
  }, []);

  return {
    filters,
    filteredCustomers,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    resetFilters
  };
};
