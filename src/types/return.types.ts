export interface Return {
  id: number;
  return_number: string;
  sale_number: string;
  customer_name: string;
  return_date: string;
  return_type: 'full' | 'partial';
  reason: 'defective' | 'wrong_item' | 'not_needed' | 'damaged' | 'other';
  total_amount: number;
  refund_amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  refund_status: 'pending' | 'processed' | 'cancelled';
}

export interface ReturnFilters {
  searchTerm: string;
  statusFilter: string;
}

export interface ReturnStats {
  totalReturns: number;
  pendingReturns: number;
  completedReturns: number;
  totalRefundAmount: number;
}
