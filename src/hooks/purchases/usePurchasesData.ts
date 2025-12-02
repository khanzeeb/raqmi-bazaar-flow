// usePurchasesData - Data fetching and state management
import { useState, useEffect, useCallback } from 'react';
import { Purchase } from '@/types/purchase.types';

interface UsePurchasesDataOptions {
  autoFetch?: boolean;
}

const DUMMY_PURCHASES: Purchase[] = [
  {
    id: '1',
    purchaseNumber: 'PO-001',
    supplier: { name: 'شركة الإمدادات التقنية', phone: '+966112345678', email: 'supplies@tech.com' },
    items: [
      { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 10, unitPrice: 2000, total: 20000 },
      { id: '2', name: 'طابعة ليزر', quantity: 5, unitPrice: 600, total: 3000 }
    ],
    subtotal: 23000,
    taxAmount: 3450,
    total: 26450,
    status: 'received',
    paymentMethod: 'partial',
    paymentStatus: 'partial',
    paidAmount: 15000,
    remainingAmount: 11450,
    paymentHistory: [{ id: '1', amount: 15000, date: '2024-01-12', method: 'bank_transfer', reference: 'TXN001' }],
    orderDate: '2024-01-10',
    expectedDate: '2024-01-20',
    receivedDate: '2024-01-18',
    notes: 'تم الاستلام بحالة ممتازة'
  },
  {
    id: '2',
    purchaseNumber: 'PO-002',
    supplier: { name: 'مورد الإكسسوارات', phone: '+966509876543' },
    items: [
      { id: '3', name: 'ماوس لاسلكي', quantity: 50, unitPrice: 40, total: 2000 },
      { id: '4', name: 'لوحة مفاتيح', quantity: 30, unitPrice: 80, total: 2400 }
    ],
    subtotal: 4400,
    taxAmount: 660,
    total: 5060,
    status: 'pending',
    paymentMethod: 'credit',
    paymentStatus: 'unpaid',
    paidAmount: 0,
    remainingAmount: 5060,
    paymentHistory: [],
    orderDate: '2024-01-15',
    expectedDate: '2024-01-25'
  }
];

let purchasesStore = [...DUMMY_PURCHASES];

export const usePurchasesData = (options: UsePurchasesDataOptions = {}) => {
  const { autoFetch = true } = options;

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 150));
    setPurchases([...purchasesStore]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch]);

  const updateStore = useCallback((updater: (prev: Purchase[]) => Purchase[]) => {
    purchasesStore = updater(purchasesStore);
    setPurchases([...purchasesStore]);
  }, []);

  return { purchases, loading, error, refresh: fetch, updateStore };
};
