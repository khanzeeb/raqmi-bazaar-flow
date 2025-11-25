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

export interface IReturnRepository extends IRepository<any, any> {
  findBySaleId(saleId: string): Promise<any[]>;
  findByCustomerId(customerId: string): Promise<any[]>;
  findByReturnNumber(returnNumber: string): Promise<any | null>;
  generateReturnNumber(): Promise<string>;
  getReturnStats(filters?: any): Promise<any>;
}
