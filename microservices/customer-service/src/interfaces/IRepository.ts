export interface IRepository<T, F = any> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: F): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  count(filters?: F): Promise<number>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface ICustomerRepository extends IRepository<any, any> {
  findByEmail(email: string): Promise<any | null>;
  updateCredit(id: string, amount: number, type: 'add' | 'subtract'): Promise<any | null>;
  getCreditHistory(customerId: string): Promise<any[]>;
  getCustomerStats(customerId: string): Promise<any>;
}

export interface ISupplierRepository extends IRepository<any, any> {
  findByEmail(email: string): Promise<any | null>;
  getSupplierStats(): Promise<any>;
  getSupplierPurchases(supplierId: string, filters?: any): Promise<any[]>;
}