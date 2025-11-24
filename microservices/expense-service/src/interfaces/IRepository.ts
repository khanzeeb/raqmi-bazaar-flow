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

export interface IExpenseRepository extends IRepository<any, any> {
  updateStatus(id: string, status: string): Promise<any | null>;
  attachReceipt(id: string, receiptUrl: string): Promise<any | null>;
  getStats(filters?: any): Promise<any>;
  getByCategory(filters?: any): Promise<any[]>;
  generateExpenseNumber(): Promise<string>;
}
