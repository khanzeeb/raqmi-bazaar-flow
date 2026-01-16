/**
 * Sale Lifecycle Service
 * Single Responsibility: Manage sale state transitions and lifecycle
 */

import { Sale, SaleRepository } from '../models/Sale';
import { SaleEventEmitter } from '../events/sale.events';
import { SaleNotFoundError, SaleStatusError } from '../errors/sale.errors';

export type SaleStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';

export interface ISaleLifecycleService {
  confirmSale(saleId: string): Promise<Sale>;
  completeSale(saleId: string): Promise<Sale>;
  cancelSale(saleId: string, reason: string): Promise<Sale>;
  canTransitionTo(currentStatus: SaleStatus, targetStatus: SaleStatus): boolean;
}

// Define valid state transitions
const VALID_TRANSITIONS: Record<SaleStatus, SaleStatus[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

export class SaleLifecycleService implements ISaleLifecycleService {
  constructor(private readonly saleRepository: SaleRepository) {}

  async confirmSale(saleId: string): Promise<Sale> {
    return this.transitionTo(saleId, 'confirmed');
  }

  async completeSale(saleId: string): Promise<Sale> {
    return this.transitionTo(saleId, 'completed');
  }

  async cancelSale(saleId: string, reason: string): Promise<Sale> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    const currentStatus = sale.status as SaleStatus;
    if (!this.canTransitionTo(currentStatus, 'cancelled')) {
      throw new SaleStatusError(
        `Cannot cancel sale in '${currentStatus}' status`,
        currentStatus
      );
    }

    const updatedSale = await this.saleRepository.update(saleId, {
      status: 'cancelled',
      notes: reason,
    } as any);

    if (!updatedSale) {
      throw new Error('Failed to update sale status');
    }

    // Emit cancellation event for inventory release
    SaleEventEmitter.emitSaleCancelled({
      sale_id: saleId,
      reason,
    });

    return updatedSale;
  }

  canTransitionTo(currentStatus: SaleStatus, targetStatus: SaleStatus): boolean {
    const validTargets = VALID_TRANSITIONS[currentStatus] || [];
    return validTargets.includes(targetStatus);
  }

  private async transitionTo(saleId: string, targetStatus: SaleStatus): Promise<Sale> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    const currentStatus = sale.status as SaleStatus;
    if (!this.canTransitionTo(currentStatus, targetStatus)) {
      throw new SaleStatusError(
        `Cannot transition from '${currentStatus}' to '${targetStatus}'`,
        currentStatus
      );
    }

    const updatedSale = await this.saleRepository.update(saleId, {
      status: targetStatus,
    } as any);

    if (!updatedSale) {
      throw new Error('Failed to update sale status');
    }

    return updatedSale;
  }
}
