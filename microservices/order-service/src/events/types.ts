/**
 * Event Type Definitions
 * Single Responsibility: Define event contracts for the service
 */

// Event type enum for type safety
export type SaleEventType = 
  | 'sale.created'
  | 'sale.updated'
  | 'sale.cancelled'
  | 'sale.completed'
  | 'sale.payment.received'
  | 'sale.overdue';

export type InventoryEventType =
  | 'inventory.check.request'
  | 'inventory.check.response'
  | 'inventory.reserve.request'
  | 'inventory.reserve.response'
  | 'inventory.release.request'
  | 'inventory.release.response';

export type SagaEventType =
  | 'sale.saga.started'
  | 'sale.saga.completed'
  | 'sale.saga.failed';

export type EventType = SaleEventType | InventoryEventType | SagaEventType;

// Base event payload interface
export interface BaseEventPayload {
  correlationId: string;
  timestamp: Date;
}

// Sale event payloads
export interface SaleCreatedPayload {
  sale_id: string;
  sale_number: string;
  customer_id: string;
  total_amount: number;
  items_count: number;
  reservation_id?: string;
}

export interface SaleCancelledPayload {
  sale_id: string;
  reason: string;
}

export interface SalePaymentReceivedPayload {
  sale_id: string;
  payment_id: string;
  amount: number;
  new_balance: number;
}

// Saga event payloads
export interface SagaStartedPayload {
  action: string;
  items_count: number;
}

export interface SagaCompletedPayload {
  action: string;
  reservation_id?: string;
}

export interface SagaFailedPayload {
  action: string;
  errors: string[];
  compensated: boolean;
}

// Union type for all payloads
export type EventPayloadData = 
  | SaleCreatedPayload 
  | SaleCancelledPayload 
  | SalePaymentReceivedPayload
  | SagaStartedPayload
  | SagaCompletedPayload
  | SagaFailedPayload;

export interface EventPayload<T = any> extends BaseEventPayload {
  data: T;
}
