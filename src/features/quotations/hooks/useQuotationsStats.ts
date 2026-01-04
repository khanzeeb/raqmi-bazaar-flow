// useQuotationsStats - Computed statistics
import { useMemo } from 'react';
import { Quotation, QuotationStats } from '@/types/quotation.types';

export const useQuotationsStats = (quotations: Quotation[]): QuotationStats => {
  return useMemo(() => ({
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    expired: quotations.filter(q => q.status === 'expired').length,
    totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
  }), [quotations]);
};
