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

export interface IInventoryRepository extends IRepository<any, any> {
  findByProductId(productId: string): Promise<any | null>;
  findLowStock(threshold?: number): Promise<any[]>;
  adjustStock(productId: string, quantity: number, reason: string): Promise<any>;
  getStockMovements(productId: string, filters?: any): Promise<any[]>;
}
