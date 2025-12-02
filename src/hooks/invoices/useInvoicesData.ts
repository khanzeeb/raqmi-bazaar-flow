// useInvoicesData - Data fetching and state management
import { useState, useEffect, useCallback } from 'react';
import { Invoice } from '@/types/invoice.types';
import { useToast } from '@/hooks/use-toast';

interface UseInvoicesDataOptions {
  initialLimit?: number;
  autoFetch?: boolean;
}

// Dummy data
const DUMMY_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customer: {
      name: 'شركة التقنية المتقدمة',
      phone: '+966112345678',
      email: 'info@techadvanced.com',
      address: 'الرياض، المملكة العربية السعودية',
      taxId: '123456789',
      type: 'business'
    },
    items: [
      { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 5, unitPrice: 2500, total: 12500 },
      { id: '2', name: 'طابعة ليزر', quantity: 2, unitPrice: 800, total: 1600 }
    ],
    subtotal: 14100,
    taxRate: 15,
    taxAmount: 2115,
    discount: 500,
    total: 15715,
    status: 'sent',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    paymentTerms: '30 يوم',
    currency: 'SAR',
    language: 'both',
    qrCode: 'QR123456789',
    notes: 'شكراً لثقتكم بنا',
    customFields: { poNumber: 'PO-2024-001', deliveryTerms: 'تسليم فوري' }
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customer: { name: 'أحمد محمد العلي', phone: '+966501234567', email: 'ahmed@example.com', type: 'individual' },
    items: [
      { id: '3', name: 'ماوس لاسلكي', quantity: 1, unitPrice: 50, total: 50 },
      { id: '4', name: 'لوحة مفاتيح', quantity: 1, unitPrice: 120, total: 120 }
    ],
    subtotal: 170,
    taxRate: 15,
    taxAmount: 25.5,
    discount: 0,
    total: 195.5,
    status: 'paid',
    issueDate: '2024-01-16',
    dueDate: '2024-01-31',
    paymentTerms: '15 يوم',
    currency: 'SAR',
    language: 'ar'
  }
];

let invoicesStore = [...DUMMY_INVOICES];

export const useInvoicesData = (options: UseInvoicesDataOptions = {}) => {
  const { toast } = useToast();
  const { autoFetch = true } = options;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 150));
    setInvoices([...invoicesStore]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch]);

  const updateStore = useCallback((updater: (prev: Invoice[]) => Invoice[]) => {
    invoicesStore = updater(invoicesStore);
    setInvoices([...invoicesStore]);
  }, []);

  return { invoices, loading, error, refresh: fetch, updateStore };
};
