// useQuotationsData - Data fetching and state management
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Quotation, QuotationFilters, QuotationStatus } from '@/types/quotation.types';
import { useToast } from '@/hooks/use-toast';

interface UseQuotationsDataOptions {
  initialLimit?: number;
  autoFetch?: boolean;
}

// Dummy data
const DUMMY_QUOTATIONS: Quotation[] = [
  {
    id: '1',
    quotationNumber: 'QT-001',
    customer: { name: 'أحمد محمد', phone: '+966501234567', email: 'ahmed@example.com', type: 'individual' },
    items: [
      { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 1, price: 2500, total: 2500 },
      { id: '2', name: 'ماوس لاسلكي', quantity: 2, price: 50, total: 100 }
    ],
    subtotal: 2600,
    taxRate: 15,
    taxAmount: 390,
    discount: 100,
    total: 2890,
    validityDays: 30,
    expiryDate: '2024-02-15',
    status: 'sent',
    createdAt: '2024-01-15',
    notes: 'عرض خاص للعميل المميز',
    history: [
      { id: '1', action: 'created', timestamp: '2024-01-15T10:00:00Z' },
      { id: '2', action: 'sent', timestamp: '2024-01-15T14:30:00Z', notes: 'تم الإرسال عبر الواتساب' }
    ]
  },
  {
    id: '2',
    quotationNumber: 'QT-002',
    customer: { name: 'شركة التقنية المتقدمة', phone: '+966112345678', type: 'business' },
    items: [{ id: '3', name: 'طابعة ليزر', quantity: 5, price: 800, total: 4000 }],
    subtotal: 4000,
    taxRate: 15,
    taxAmount: 600,
    discount: 200,
    total: 4400,
    validityDays: 15,
    expiryDate: '2024-02-01',
    status: 'draft',
    createdAt: '2024-01-16',
    history: [{ id: '1', action: 'created', timestamp: '2024-01-16T09:00:00Z' }]
  }
];

let quotationsStore = [...DUMMY_QUOTATIONS];

export const useQuotationsData = (options: UseQuotationsDataOptions = {}) => {
  const { toast } = useToast();
  const { initialLimit = 50, autoFetch = true } = options;

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setQuotations([...quotationsStore]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch]);

  const updateStore = useCallback((updater: (prev: Quotation[]) => Quotation[]) => {
    quotationsStore = updater(quotationsStore);
    setQuotations([...quotationsStore]);
  }, []);

  return {
    quotations,
    loading,
    error,
    refresh: fetch,
    updateStore,
  };
};
