// Service interfaces - Single Responsibility: Business logic contracts

import { IPaginatedResponse } from './IProduct';

export interface IService<T, TCreateDTO, TUpdateDTO, TFilters> {
  getById(id: string): Promise<T | null>;
  getAll(filters?: TFilters): Promise<IPaginatedResponse<T>>;
  create(data: TCreateDTO): Promise<T>;
  update(id: string, data: TUpdateDTO): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IProductService<T, TCreateDTO, TUpdateDTO, TFilters> 
  extends IService<T, TCreateDTO, TUpdateDTO, TFilters> {
  updateStock(id: string, newStock: number, reason?: string): Promise<T | null>;
  getLowStockProducts(limit?: number): Promise<T[]>;
  getCategories(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
  getStats(): Promise<IProductStats>;
}

export interface IProductStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}
