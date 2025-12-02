export interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    type: 'individual' | 'business';
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discount: number;
  total: number;
  paymentMode: 'cash' | 'bank_transfer' | 'credit';
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  status: 'pending' | 'completed' | 'returned';
  createdAt: string;
  notes?: string;
}

export interface SalesOrderFilters {
  searchTerm: string;
  selectedStatus: 'all' | SalesOrder['status'];
}

export interface SalesOrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}
