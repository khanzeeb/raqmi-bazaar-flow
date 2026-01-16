/**
 * Pricing Event Service
 * Listens to product events for dynamic pricing
 */
import { BaseEventService, EventListenerConfig } from '../../shared/events/BaseEventService';
import { EventPayload, ProductCreatedPayload, ProductStockUpdatedPayload } from '../../shared/events/types';

export class PricingEventService extends BaseEventService {
  constructor() { super('pricing-service'); }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      { eventType: 'product.created', handler: this.handleProductCreated },
      { eventType: 'product.updated', handler: this.handleProductUpdated },
      { eventType: 'product.stock.updated', handler: this.handleStockUpdated },
      { eventType: 'product.low_stock', handler: this.handleLowStock },
    ];
  }

  emitPriceUpdated(payload: { product_id: string; old_price: number; new_price: number; reason: string }): void {
    this.emit('product.updated', { ...payload, changes: { price: payload.new_price } });
  }

  private async handleProductCreated(payload: EventPayload<ProductCreatedPayload>): Promise<void> {
    console.log(`[pricing-service] New product: ${payload.data.product_id}`);
    // Initialize pricing rules
  }

  private async handleProductUpdated(payload: EventPayload<{ product_id: string }>): Promise<void> {
    console.log(`[pricing-service] Product updated: ${payload.data.product_id}`);
    // Recalculate dynamic pricing
  }

  private async handleStockUpdated(payload: EventPayload<ProductStockUpdatedPayload>): Promise<void> {
    console.log(`[pricing-service] Stock change for: ${payload.data.product_id}`);
    // Adjust pricing based on stock levels
  }

  private async handleLowStock(payload: EventPayload<{ product_id: string; current_stock: number }>): Promise<void> {
    console.log(`[pricing-service] Low stock alert: ${payload.data.product_id}`);
    // Could trigger price increase for scarcity
  }
}

export const pricingEventService = new PricingEventService();
