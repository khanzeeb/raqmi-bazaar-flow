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

export interface IInventoryService extends IService<any, any, any, any> {
  adjustStock(productId: string, quantity: number, reason: string): Promise<any>;
  transferStock(fromLocation: string, toLocation: string, productId: string, quantity: number): Promise<any>;
  getLowStockItems(threshold?: number): Promise<any[]>;
  getStockMovements(productId: string, filters?: any): Promise<any[]>;
  getInventoryStats(filters?: any): Promise<any>;
}
