import { useMemo } from 'react';
import { Supplier, SupplierStats } from '@/types/supplier.types';

export const useSuppliersStats = (suppliers: Supplier[]): SupplierStats => {
  return useMemo(() => ({
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    inactiveSuppliers: suppliers.filter(s => s.status === 'inactive').length,
    totalCreditLimit: suppliers.reduce((sum, s) => sum + s.creditLimit, 0),
    totalSpent: suppliers.reduce((sum, s) => sum + s.totalSpent, 0),
  }), [suppliers]);
};
