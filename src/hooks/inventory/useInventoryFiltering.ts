import { useState, useMemo } from 'react';
import { InventoryItem, InventoryFilters } from '@/types/inventory.types';

export const useInventoryFiltering = (inventory: InventoryItem[]) => {
  const [filters, setFilters] = useState<InventoryFilters>({
    searchTerm: '',
    selectedCategory: 'all',
    selectedStatus: 'all'
  });

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesCategory = filters.selectedCategory === 'all' || item.category === filters.selectedCategory;
      const matchesStatus = filters.selectedStatus === 'all' || item.status === filters.selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, filters]);

  const setSearchTerm = (term: string) => setFilters(prev => ({ ...prev, searchTerm: term }));
  const setSelectedCategory = (category: string) => setFilters(prev => ({ ...prev, selectedCategory: category }));
  const setSelectedStatus = (status: string) => setFilters(prev => ({ ...prev, selectedStatus: status }));

  return {
    filters,
    filteredInventory,
    setSearchTerm,
    setSelectedCategory,
    setSelectedStatus
  };
};
