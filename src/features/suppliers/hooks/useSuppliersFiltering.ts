import { useState, useMemo, useCallback } from 'react';
import { Supplier, SupplierFilters } from '@/types/supplier.types';

export const useSuppliersFiltering = (suppliers: Supplier[]) => {
  const [filters, setFilters] = useState<SupplierFilters>({
    searchQuery: '',
    status: 'all',
    country: 'all',
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch = !filters.searchQuery ||
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.contactPerson.toLowerCase().includes(searchLower) ||
        supplier.email.toLowerCase().includes(searchLower) ||
        supplier.phone.includes(filters.searchQuery);

      const matchesStatus = filters.status === 'all' || supplier.status === filters.status;
      const matchesCountry = filters.country === 'all' || supplier.address.country === filters.country;

      return matchesSearch && matchesStatus && matchesCountry;
    });
  }, [suppliers, filters]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setStatusFilter = useCallback((status: SupplierFilters['status']) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: '', status: 'all', country: 'all' });
  }, []);

  return { filters, filteredSuppliers, setSearchQuery, setStatusFilter, resetFilters };
};
