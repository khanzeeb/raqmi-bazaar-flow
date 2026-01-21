// Stock Movement Repository Interface - Single Responsibility: Stock movement data access contract

import { IBaseRepository } from './IBaseRepository';
import { IStockMovementData, IMovementSummary } from '../data';
import { IStockMovementFilters } from '../filters';
import { MovementType } from '@prisma/client';

export interface IStockMovementRepository extends IBaseRepository<IStockMovementData, IStockMovementFilters> {
  findByProductId(productId: string): Promise<IStockMovementData[]>;
  findByVariantId(variantId: string): Promise<IStockMovementData[]>;
  createForProduct(productId: string, type: MovementType, quantity: number, reason?: string): Promise<IStockMovementData>;
  createForVariant(variantId: string, type: MovementType, quantity: number, reason?: string): Promise<IStockMovementData>;
  getMovementSummary(productId: string): Promise<IMovementSummary[]>;
  getRecentMovements(limit?: number): Promise<IStockMovementData[]>;
}
