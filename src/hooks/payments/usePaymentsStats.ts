// usePaymentsStats - Computed statistics
import { useMemo } from 'react';
import { Payment, CustomerCredit, PaymentStats } from '@/types/payment.types';

export const usePaymentsStats = (payments: Payment[], customerCredits: CustomerCredit[]): PaymentStats => {
  return useMemo(() => ({
    totalPayments: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    totalOutstanding: customerCredits.reduce((sum, c) => sum + c.totalOutstanding, 0),
    blockedCustomers: customerCredits.filter(c => c.creditStatus === 'blocked').length,
  }), [payments, customerCredits]);
};
