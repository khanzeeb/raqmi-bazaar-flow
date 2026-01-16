/**
 * Inventory Event Service
 * Handles inventory-related domain events and saga participation
 */

import { 
  BaseEventService, 
  EventListenerConfig 
} from '../../shared/events/BaseEventService';
import { 
  SagaManager,
  createSagaManager
} from '../../shared/events/SagaManager';
import { 
  EventPayload,
  SagaStep,
  InventoryCheckRequest,
  InventoryCheckResponse,
  InventoryReserveRequest,
  InventoryReserveResponse,
  InventoryReleaseRequest,
  ProductCreatedPayload,
  ProductStockUpdatedPayload,
  PurchaseReceivedPayload,
  ReturnCompletedPayload,
  SaleCreatedPayload,
  SaleCancelledPayload
} from '../../shared/events/types';

export interface ReservationRecord {
  reservation_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  created_at: Date;
  expires_at: Date;
  status: 'active' | 'released' | 'expired';
}

export class InventoryEventService extends BaseEventService {
  private reservations: Map<string, ReservationRecord> = new Map();
  private reservationTTL: number = 15 * 60 * 1000; // 15 minutes

  constructor() {
    super('inventory-service');
  }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Listen for product events
      { eventType: 'product.created', handler: this.handleProductCreated },
      { eventType: 'product.stock.updated', handler: this.handleProductStockUpdated },
      
      // Listen for purchase events to add stock
      { eventType: 'purchase.received', handler: this.handlePurchaseReceived },
      
      // Listen for return events to restock
      { eventType: 'return.completed', handler: this.handleReturnCompleted },
      
      // Listen for sale events to adjust stock
      { eventType: 'sale.created', handler: this.handleSaleCreated },
      { eventType: 'sale.cancelled', handler: this.handleSaleCancelled },
      
      // Listen for saga events
      { eventType: 'saga.failed', handler: this.handleSagaFailed },
    ];
  }

  protected onInitialized(): void {
    // Start reservation cleanup interval
    setInterval(() => this.cleanupExpiredReservations(), 60000);
  }

  // ============= Event Emitters =============

  emitInventoryChecked(payload: InventoryCheckResponse): void {
    this.emit('inventory.check.response', payload);
  }

  emitInventoryReserved(payload: InventoryReserveResponse): void {
    this.emit('inventory.reserve.response', payload);
  }

  emitInventoryReleased(payload: { reservation_id: string; success: boolean }): void {
    this.emit('inventory.release.response', payload);
  }

  emitInventoryAdjusted(payload: { product_id: string; adjustment: number; reason: string; new_stock: number }): void {
    this.emit('inventory.adjusted', payload);
  }

  emitMovementCreated(payload: { product_id: string; type: 'in' | 'out'; quantity: number; reference: string }): void {
    this.emit('inventory.movement.created', payload);
  }

  // ============= Saga Operations =============

  /**
   * Check inventory availability
   */
  async checkInventory(request: InventoryCheckRequest): Promise<InventoryCheckResponse> {
    // This would typically call the actual inventory repository
    const response: InventoryCheckResponse = {
      success: true,
      available: true,
      items: request.items.map(item => ({
        product_id: item.product_id,
        requested_quantity: item.quantity,
        available_quantity: item.quantity, // Would be actual stock from DB
        is_available: true,
      })),
    };

    this.emit('inventory.check.response', response);
    return response;
  }

  /**
   * Reserve inventory for a transaction
   */
  async reserveInventory(request: InventoryReserveRequest): Promise<InventoryReserveResponse> {
    const reservationId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + (request.ttl_minutes || 15) * 60 * 1000);

    // Store reservation
    const reservation: ReservationRecord = {
      reservation_id: reservationId,
      items: request.items,
      created_at: new Date(),
      expires_at: expiresAt,
      status: 'active',
    };
    this.reservations.set(reservationId, reservation);

    const response: InventoryReserveResponse = {
      success: true,
      reservation_id: reservationId,
      items: request.items.map(item => ({
        product_id: item.product_id,
        reserved_quantity: item.quantity,
      })),
      expires_at: expiresAt,
    };

    this.emit('inventory.reserve.response', response);
    return response;
  }

  /**
   * Release a reservation (compensation action)
   */
  async releaseReservation(request: InventoryReleaseRequest): Promise<void> {
    const reservation = this.reservations.get(request.reservation_id);
    
    if (reservation && reservation.status === 'active') {
      reservation.status = 'released';
      this.reservations.set(request.reservation_id, reservation);
      
      this.emit('inventory.release.response', {
        reservation_id: request.reservation_id,
        success: true,
      });
    }
  }

  /**
   * Create an inventory saga for stock operations
   */
  createInventorySaga(): SagaManager {
    const saga = createSagaManager({
      name: 'inventory-saga',
      eventEmitter: this.eventEmitter,
    });

    // Step 1: Check availability
    const checkStep: SagaStep<InventoryCheckRequest, InventoryCheckResponse> = {
      name: 'check_inventory',
      execute: async (request) => this.checkInventory(request),
    };

    // Step 2: Reserve stock
    const reserveStep: SagaStep<InventoryCheckResponse, InventoryReserveResponse> = {
      name: 'reserve_inventory',
      execute: async (checkResult) => {
        if (!checkResult.available) {
          throw new Error('Inventory not available');
        }
        return this.reserveInventory({
          items: checkResult.items.map(item => ({
            product_id: item.product_id,
            quantity: item.requested_quantity,
          })),
        });
      },
      compensate: async (_, output) => {
        if (output.reservation_id) {
          await this.releaseReservation({ reservation_id: output.reservation_id });
        }
      },
    };

    return saga.addStep(checkStep).addStep(reserveStep);
  }

  // ============= Event Handlers =============

  private async handleProductCreated(payload: EventPayload<ProductCreatedPayload>): Promise<void> {
    console.log(`[inventory-service] Processing product.created: ${payload.data.product_id}`);
    // Initialize inventory tracking for new product
  }

  private async handleProductStockUpdated(payload: EventPayload<ProductStockUpdatedPayload>): Promise<void> {
    console.log(`[inventory-service] Processing product.stock.updated: ${payload.data.product_id}`);
    // Sync inventory records with product stock
  }

  private async handlePurchaseReceived(payload: EventPayload<PurchaseReceivedPayload>): Promise<void> {
    console.log(`[inventory-service] Processing purchase.received: ${payload.data.purchase_id}`);
    // Add stock for received items
    for (const item of payload.data.received_items) {
      this.emitMovementCreated({
        product_id: item.product_id,
        type: 'in',
        quantity: item.quantity,
        reference: `purchase:${payload.data.purchase_id}`,
      });
    }
  }

  private async handleReturnCompleted(payload: EventPayload<ReturnCompletedPayload>): Promise<void> {
    console.log(`[inventory-service] Processing return.completed: ${payload.data.return_id}`);
    if (payload.data.items_restocked) {
      // Stock was already added during return processing
    }
  }

  private async handleSaleCreated(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[inventory-service] Processing sale.created: ${payload.data.sale_id}`);
    // Confirm reservation or deduct stock
    if (payload.data.reservation_id) {
      const reservation = this.reservations.get(payload.data.reservation_id);
      if (reservation) {
        reservation.status = 'released'; // Consumed
        this.reservations.set(payload.data.reservation_id, reservation);
      }
    }
  }

  private async handleSaleCancelled(payload: EventPayload<SaleCancelledPayload>): Promise<void> {
    console.log(`[inventory-service] Processing sale.cancelled: ${payload.data.sale_id}`);
    // Return stock if sale is cancelled
  }

  private async handleSagaFailed(payload: EventPayload<{ saga_name: string; compensated: boolean }>): Promise<void> {
    if (payload.data.saga_name.includes('inventory')) {
      console.log(`[inventory-service] Saga failed, compensation handled: ${payload.data.compensated}`);
    }
  }

  private cleanupExpiredReservations(): void {
    const now = new Date();
    for (const [id, reservation] of this.reservations) {
      if (reservation.status === 'active' && reservation.expires_at < now) {
        reservation.status = 'expired';
        this.reservations.set(id, reservation);
        this.emit('inventory.release.response', { reservation_id: id, success: true, reason: 'expired' });
      }
    }
  }
}

// Singleton instance
export const inventoryEventService = new InventoryEventService();
