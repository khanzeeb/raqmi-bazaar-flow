// useInvoicesStats - Computed statistics
import { useMemo } from 'react';
import { Invoice, InvoiceStats } from '@/types/invoice.types';

export const useInvoicesStats = (invoices: Invoice[]): InvoiceStats => {
  return useMemo(() => ({
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
    count: invoices.length,
  }), [invoices]);
};
