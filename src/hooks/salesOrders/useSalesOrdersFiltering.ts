// useSalesOrdersFiltering - Client-side filtering for sales orders
import { useState, useMemo } from 'react';
import { SalesOrder, SalesOrderFilters } from '@/types/salesOrder.types';

export const useSalesOrdersFiltering = (orders: SalesOrder[]) => {
  const [filters, setFilters] = useState<SalesOrderFilters>({
    searchTerm: '',
    selectedStatus: 'all'
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (order.customer.phone && order.customer.phone.includes(filters.searchTerm));
      
      const matchesStatus = filters.selectedStatus === 'all' || order.status === filters.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, filters]);

  const setSearchTerm = (term: string) => setFilters(prev => ({ ...prev, searchTerm: term }));
  const setSelectedStatus = (status: SalesOrderFilters['selectedStatus']) => setFilters(prev => ({ ...prev, selectedStatus: status }));
  const resetFilters = () => setFilters({ searchTerm: '', selectedStatus: 'all' });

  return { 
    filters, 
    filteredOrders, 
    setSearchTerm, 
    setSelectedStatus,
    resetFilters 
  };
};
