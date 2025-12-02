export interface Customer {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  customerType: 'individual' | 'business';
  status: 'active' | 'inactive';
  balance: number;
  lifetimeValue: number;
  totalOrders: number;
  lastOrderDate?: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
  notes?: string;
  tags?: string[];
  dateAdded: string;
}

export interface CustomerFilters {
  searchQuery: string;
  status: 'all' | 'active' | 'inactive';
  type: 'all' | 'individual' | 'business';
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  businessCustomers: number;
  totalCredit: number;
  totalDue: number;
}
