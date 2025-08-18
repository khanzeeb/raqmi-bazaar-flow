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

export interface IProductRepository extends IRepository<any, any> {
  findByIds(ids: string[]): Promise<any[]>;
  updateStock(id: string, newStock: number, reason?: string): Promise<any | null>;
  getCategories(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
}

export interface IProductCategoryRepository extends IRepository<any, any> {
  getTree(): Promise<any[]>;
}

export interface IProductVariantRepository extends IRepository<any, any> {
  findByProductId(productId: string): Promise<any[]>;
  createMultiple(variants: any[]): Promise<any[]>;
  deleteByProductId(productId: string): Promise<boolean>;
  updateStock(id: string, newStock: number, reason?: string): Promise<any | null>;
}