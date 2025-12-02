// usePaymentsData - Data fetching and state management
import { useState, useEffect, useCallback } from 'react';
import { Payment, CustomerCredit } from '@/types/payment.types';

interface UsePaymentsDataOptions {
  autoFetch?: boolean;
}

const DUMMY_PAYMENTS: Payment[] = [
  {
    id: '1',
    paymentNumber: 'PAY-001',
    customerId: '1',
    customerName: 'أحمد محمد',
    amount: 2890,
    paymentMethod: 'cash',
    paymentDate: '2024-01-15',
    status: 'completed',
    reference: '',
    notes: 'دفعة كاملة لطلب SO-001',
    relatedOrderIds: ['1'],
    allocations: [{
      orderId: '1', orderNumber: 'SO-001', allocatedAmount: 2890,
      orderTotal: 2890, previouslyPaid: 0, remainingAfterPayment: 0
    }],
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    paymentNumber: 'PAY-002',
    customerId: '2',
    customerName: 'شركة التقنية المتقدمة',
    amount: 1500,
    paymentMethod: 'bank_transfer',
    paymentDate: '2024-01-16',
    status: 'completed',
    reference: 'TXN-123456',
    notes: 'دفعة جزئية',
    relatedOrderIds: ['2'],
    allocations: [{
      orderId: '2', orderNumber: 'SO-002', allocatedAmount: 1500,
      orderTotal: 2760, previouslyPaid: 0, remainingAfterPayment: 1260
    }],
    createdAt: '2024-01-16T14:30:00Z'
  }
];

const DUMMY_CREDITS: CustomerCredit[] = [
  { customerId: '1', customerName: 'أحمد محمد', creditLimit: 5000, availableCredit: 5000, usedCredit: 0, overdueAmount: 0, totalOutstanding: 0, creditStatus: 'good' },
  { customerId: '2', customerName: 'شركة التقنية المتقدمة', creditLimit: 10000, availableCredit: 8740, usedCredit: 1260, overdueAmount: 0, totalOutstanding: 1260, creditStatus: 'good' },
  { customerId: '3', customerName: 'فاطمة أحمد', creditLimit: 3000, availableCredit: 500, usedCredit: 2500, overdueAmount: 800, totalOutstanding: 3300, creditStatus: 'warning' }
];

let paymentsStore = [...DUMMY_PAYMENTS];
let creditsStore = [...DUMMY_CREDITS];

export const usePaymentsData = (options: UsePaymentsDataOptions = {}) => {
  const { autoFetch = true } = options;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [customerCredits, setCustomerCredits] = useState<CustomerCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 150));
    setPayments([...paymentsStore]);
    setCustomerCredits([...creditsStore]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch]);

  const updatePaymentsStore = useCallback((updater: (prev: Payment[]) => Payment[]) => {
    paymentsStore = updater(paymentsStore);
    setPayments([...paymentsStore]);
  }, []);

  const updateCreditsStore = useCallback((updater: (prev: CustomerCredit[]) => CustomerCredit[]) => {
    creditsStore = updater(creditsStore);
    setCustomerCredits([...creditsStore]);
  }, []);

  return { payments, customerCredits, loading, error, refresh: fetch, updatePaymentsStore, updateCreditsStore };
};
