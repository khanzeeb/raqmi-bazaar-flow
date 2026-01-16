/**
 * Supplier Event Service
 * Handles supplier-related domain events
 */

import { 
  BaseEventService, 
  EventListenerConfig 
} from '../../shared/events/BaseEventService';
import { 
  EventPayload,
  PurchaseCreatedPayload,
  PurchaseReceivedPayload
} from '../../shared/events/types';

export class SupplierEventService extends BaseEventService {
  constructor() {
    super('customer-service');
  }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Listen for purchase events to update supplier statistics
      { eventType: 'purchase.created', handler: this.handlePurchaseCreated },
      { eventType: 'purchase.received', handler: this.handlePurchaseReceived },
      { eventType: 'purchase.cancelled', handler: this.handlePurchaseCancelled },
    ];
  }

  // ============= Event Emitters =============

  emitSupplierCreated(payload: { supplier_id: string; name: string; email?: string }): void {
    this.emit('supplier.created', payload);
  }

  emitSupplierUpdated(payload: { supplier_id: string; changes: Record<string, any> }): void {
    this.emit('supplier.updated', payload);
  }

  emitSupplierDeleted(payload: { supplier_id: string }): void {
    this.emit('supplier.deleted', payload);
  }

  // ============= Event Handlers =============

  private async handlePurchaseCreated(payload: EventPayload<PurchaseCreatedPayload>): Promise<void> {
    console.log(`[customer-service] Processing purchase.created for supplier ${payload.data.supplier_id}`);
    // Update supplier's order count and total value
  }

  private async handlePurchaseReceived(payload: EventPayload<PurchaseReceivedPayload>): Promise<void> {
    console.log(`[customer-service] Processing purchase.received for ${payload.data.purchase_id}`);
    // Update supplier's fulfilled orders count
  }

  private async handlePurchaseCancelled(payload: EventPayload<{ purchase_id: string; supplier_id: string }>): Promise<void> {
    console.log(`[customer-service] Processing purchase.cancelled for ${payload.data.purchase_id}`);
    // Update supplier's cancelled orders count
  }
}

// Singleton instance
export const supplierEventService = new SupplierEventService();
