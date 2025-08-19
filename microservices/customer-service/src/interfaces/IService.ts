export interface IService<T, CreateDTO, UpdateDTO, FilterDTO> {
  getById(id: string): Promise<T | null>;
  getAll(filters?: FilterDTO): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface ICustomerService extends IService<any, any, any, any> {
  updateCredit(id: string, amount: number, type: 'add' | 'subtract', reason?: string): Promise<any | null>;
  getCreditHistory(customerId: string, filters?: any): Promise<any>;
  getCustomerStats(customerId: string): Promise<any>;
  blockCustomer(id: string, reason?: string): Promise<any | null>;
  unblockCustomer(id: string, reason?: string): Promise<any | null>;
}

export interface ISupplierService extends IService<any, any, any, any> {
  getSupplierStats(): Promise<any>;
  getSupplierPurchases(supplierId: string, filters?: any): Promise<any[]>;
}