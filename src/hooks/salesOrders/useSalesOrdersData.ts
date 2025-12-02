import { useState } from 'react';
import { SalesOrder } from '@/types/salesOrder.types';

export const useSalesOrdersData = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([
    {
      id: '1',
      orderNumber: 'SO-001',
      customer: { name: 'أحمد محمد', phone: '+966501234567', type: 'individual' },
      items: [
        { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 1, price: 2500, total: 2500 },
        { id: '2', name: 'ماوس لاسلكي', quantity: 2, price: 50, total: 100 }
      ],
      subtotal: 2600,
      taxRate: 15,
      taxAmount: 390,
      discount: 100,
      total: 2890,
      paymentMode: 'cash',
      paymentStatus: 'paid',
      paidAmount: 2890,
      status: 'completed',
      createdAt: '2024-01-15',
      notes: 'تسليم سريع'
    },
    {
      id: '2',
      orderNumber: 'SO-002',
      customer: { name: 'شركة التقنية المتقدمة', phone: '+966112345678', type: 'business' },
      items: [{ id: '3', name: 'طابعة ليزر', quantity: 3, price: 800, total: 2400 }],
      subtotal: 2400,
      taxRate: 15,
      taxAmount: 360,
      discount: 0,
      total: 2760,
      paymentMode: 'credit',
      paymentStatus: 'partial',
      paidAmount: 1500,
      status: 'pending',
      createdAt: '2024-01-16'
    }
  ]);

  return { orders, setOrders };
};
