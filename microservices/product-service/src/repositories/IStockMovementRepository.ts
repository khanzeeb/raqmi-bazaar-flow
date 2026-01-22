// Stock Movement Repository Interface

import type { IStockMovementData, IMovementSummary } from '../data/IStockMovementData';
import type { IStockMovementFilters } from '../filters/IStockMovementFilters';
import type { IPaginatedResponse } from './BaseRepository';
import type { MovementType } from '../dto';

export interface IStockMovementRepository {
  findById(id: string): Promise<IStockMovementData | null>;
  findAll(filters?: IStockMovementFilters, page?: number, limit?: number): Promise<IPaginatedResponse<IStockMovementData>>;
  findByProductId(productId: string): Promise<IStockMovementData[]>;
  findByVariantId(variantId: string): Promise<IStockMovementData[]>;
  create(data: any): Promise<IStockMovementData>;
  createForProduct(productId: string, type: MovementType, quantity: number, reason?: string): Promise<IStockMovementData>;
  createForVariant(variantId: string, type: MovementType, quantity: number, reason?: string): Promise<IStockMovementData>;
  getMovementSummary(productId: string): Promise<IMovementSummary[]>;
  getRecentMovements(limit?: number): Promise<IStockMovementData[]>;
  count(filters?: IStockMovementFilters): Promise<number>;
}
