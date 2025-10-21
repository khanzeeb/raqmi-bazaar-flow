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

export interface IProductService extends IService<any, any, any, any> {
  updateStock(id: string, newStock: number, reason?: string): Promise<any | null>;
  getLowStockProducts(limit?: number): Promise<any[]>;
  getCategories(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
  getStats(): Promise<{
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  }>;
}

export interface IProductCategoryService extends IService<any, any, any, any> {
  getTree(): Promise<any[]>;
}

export interface IProductVariantService extends IService<any, any, any, any> {
  getByProductId(productId: string): Promise<any[]>;
  createForProduct(productId: string, data: any): Promise<any>;
}