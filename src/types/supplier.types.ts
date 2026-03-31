export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  creditLimit: number;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  notes?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate?: string;
  rating?: number;
  dateAdded: string;
}

export interface SupplierFilters {
  searchQuery: string;
  status: 'all' | 'active' | 'inactive';
  country: 'all' | string;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  totalCreditLimit: number;
  totalSpent: number;
}

export interface CreateSupplierDTO {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: Supplier['address'];
  taxId?: string;
  creditLimit?: number;
  notes?: string;
}

export interface UpdateSupplierDTO extends Partial<CreateSupplierDTO> {
  id: string;
  status?: 'active' | 'inactive';
}
