// useInvoicesFiltering - Filtering logic
import { useState, useCallback, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '@/types/invoice.types';

interface LocalFilters {
  status: 'all' | InvoiceStatus;
}

export const useInvoicesFiltering = (invoices: Invoice[]) => {
  const [search, setSearch] = useState('');
  const [localFilters, setLocalFilters] = useState<LocalFilters>({ status: 'all' });

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = localFilters.status === 'all' || invoice.status === localFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, localFilters]);

  const updateSearch = useCallback((value: string) => setSearch(value), []);

  const updateLocalFilters = useCallback((key: keyof LocalFilters, value: 'all' | InvoiceStatus) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return { search, localFilters, filteredInvoices, updateSearch, updateLocalFilters };
};
