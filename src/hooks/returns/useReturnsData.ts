import { useState } from 'react';
import { Return } from '@/types/return.types';

const mockReturns: Return[] = [
  {
    id: 1,
    return_number: "RET-202501-0001",
    sale_number: "SALE-202501-0015",
    customer_name: "Ahmed Hassan",
    return_date: "2025-01-03",
    return_type: "partial",
    reason: "defective",
    total_amount: 150.00,
    refund_amount: 150.00,
    status: "completed",
    refund_status: "processed"
  },
  {
    id: 2,
    return_number: "RET-202501-0002",
    sale_number: "SALE-202501-0012",
    customer_name: "Sara Mohamed",
    return_date: "2025-01-02",
    return_type: "full",
    reason: "not_needed",
    total_amount: 320.00,
    refund_amount: 320.00,
    status: "pending",
    refund_status: "pending"
  },
  {
    id: 3,
    return_number: "RET-202501-0003",
    sale_number: "SALE-202501-0008",
    customer_name: "Omar Ali",
    return_date: "2025-01-01",
    return_type: "partial",
    reason: "wrong_item",
    total_amount: 75.00,
    refund_amount: 0.00,
    status: "rejected",
    refund_status: "cancelled"
  }
];

export const useReturnsData = () => {
  const [returns, setReturns] = useState<Return[]>(mockReturns);
  return { returns, setReturns };
};
