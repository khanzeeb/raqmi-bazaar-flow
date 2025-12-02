// usePurchasesFiltering - Filtering logic
import { useState, useCallback, useMemo } from 'react';
import { Purchase, PurchaseStatus } from '@/types/purchase.types';

interface LocalFilters {
  status: 'all' | PurchaseStatus;
}

export const usePurchasesFiltering = (purchases: Purchase[]) => {
  const [search, setSearch] = useState('');
  const [localFilters, setLocalFilters] = useState<LocalFilters>({ status: 'all' });

  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const matchesSearch = 
        purchase.purchaseNumber.toLowerCase().includes(search.toLowerCase()) ||
        purchase.supplier.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = localFilters.status === 'all' || purchase.status === localFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [purchases, search, localFilters]);

  const updateSearch = useCallback((value: string) => setSearch(value), []);

  const updateLocalFilters = useCallback((key: keyof LocalFilters, value: 'all' | PurchaseStatus) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return { search, localFilters, filteredPurchases, updateSearch, updateLocalFilters };
};
