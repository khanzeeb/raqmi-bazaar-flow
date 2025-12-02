import { useState, useMemo } from 'react';
import { Customer, CustomerFilters } from '@/types/customer.types';

export const useCustomersFiltering = (customers: Customer[]) => {
  const [filters, setFilters] = useState<CustomerFilters>({
    searchQuery: '',
    status: 'all',
    type: 'all'
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        customer.nameAr.includes(filters.searchQuery) ||
        customer.email.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        customer.phone.includes(filters.searchQuery);
      const matchesStatus = filters.status === 'all' || customer.status === filters.status;
      const matchesType = filters.type === 'all' || customer.customerType === filters.type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [customers, filters]);

  const setSearchQuery = (query: string) => setFilters(prev => ({ ...prev, searchQuery: query }));
  const setStatusFilter = (status: CustomerFilters['status']) => setFilters(prev => ({ ...prev, status }));
  const setTypeFilter = (type: CustomerFilters['type']) => setFilters(prev => ({ ...prev, type }));

  return {
    filters,
    filteredCustomers,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter
  };
};
