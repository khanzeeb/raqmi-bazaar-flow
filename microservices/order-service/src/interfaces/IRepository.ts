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

export interface ISaleRepository extends IRepository<any, any> {
  findBySaleNumber(saleNumber: string): Promise<any | null>;
  updatePaymentAmounts(saleId: string): Promise<any>;
  getSaleStats(filters?: any): Promise<any>;
  getOverdueSales(): Promise<any[]>;
  generateSaleNumber(): Promise<string>;
}

export interface IReturnRepository extends IRepository<any, any> {
  findBySaleId(saleId: string): Promise<any[]>;
  getSaleStateBeforeReturn(saleId: string, returnId?: string): Promise<any>;
  getSaleStateAfterReturn(saleId: string, returnId: string): Promise<any>;
}

export interface IPaymentRepository extends IRepository<any, any> {
  findByCustomerId(customerId: string): Promise<any[]>;
  allocateToOrder(paymentId: string, orderId: string, orderType: string, amount: number): Promise<any>;
  getUnallocatedAmount(paymentId: string): Promise<number>;
}