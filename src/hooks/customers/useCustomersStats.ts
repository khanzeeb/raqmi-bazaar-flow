import { useMemo } from 'react';
import { Customer, CustomerStats } from '@/types/customer.types';

export const useCustomersStats = (customers: Customer[]): CustomerStats => {
  return useMemo(() => ({
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    businessCustomers: customers.filter(c => c.customerType === 'business').length,
    totalCredit: customers.filter(c => c.balance > 0).reduce((sum, c) => sum + c.balance, 0),
    totalDue: customers.filter(c => c.balance < 0).reduce((sum, c) => sum + Math.abs(c.balance), 0)
  }), [customers]);
};
