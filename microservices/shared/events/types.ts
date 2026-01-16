/**
 * Shared Event Type Definitions
 * All microservices use these types for consistent event-driven communication
 */

// ============= Base Event Types =============

export interface BaseEventPayload {
  correlationId: string;
  timestamp: Date;
  source: string;
}

export interface EventPayload<T = any> extends BaseEventPayload {
  data: T;
}

// ============= Saga Types =============

export enum SagaStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  COMPENSATING = 'COMPENSATING',
  FAILED = 'FAILED',
}

export interface SagaStep<TInput, TOutput> {
  name: string;
  execute: (input: TInput) => Promise<TOutput>;
  compensate?: (input: TInput, output: TOutput) => Promise<void>;
}

export interface SagaContext {
  correlationId: string;
  status: SagaStatus;
  currentStep: number;
  steps: SagaStep<any, any>[];
  results: Map<string, { input: any; output: any }>;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

export interface SagaResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  compensated?: boolean;
}

// ============= Domain Event Types =============

// Customer Events
export type CustomerEventType =
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'customer.credit.updated'
  | 'customer.blocked'
  | 'customer.unblocked';

// Supplier Events  
export type SupplierEventType =
  | 'supplier.created'
  | 'supplier.updated'
  | 'supplier.deleted';

// Product Events
export type ProductEventType =
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.stock.updated'
  | 'product.low_stock';

// Inventory Events
export type InventoryEventType =
  | 'inventory.check.request'
  | 'inventory.check.response'
  | 'inventory.reserve.request'
  | 'inventory.reserve.response'
  | 'inventory.release.request'
  | 'inventory.release.response'
  | 'inventory.adjusted'
  | 'inventory.movement.created';

// Order/Sale Events
export type SaleEventType =
  | 'sale.created'
  | 'sale.updated'
  | 'sale.cancelled'
  | 'sale.completed'
  | 'sale.confirmed'
  | 'sale.payment.received'
  | 'sale.overdue';

// Invoice Events
export type InvoiceEventType =
  | 'invoice.created'
  | 'invoice.updated'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'invoice.cancelled';

// Payment Events
export type PaymentEventType =
  | 'payment.created'
  | 'payment.completed'
  | 'payment.allocated'
  | 'payment.cancelled'
  | 'payment.refunded';

// Purchase Events
export type PurchaseEventType =
  | 'purchase.created'
  | 'purchase.updated'
  | 'purchase.received'
  | 'purchase.cancelled'
  | 'purchase.payment.added';

// Expense Events
export type ExpenseEventType =
  | 'expense.created'
  | 'expense.updated'
  | 'expense.approved'
  | 'expense.rejected'
  | 'expense.paid';

// Return Events
export type ReturnEventType =
  | 'return.created'
  | 'return.approved'
  | 'return.rejected'
  | 'return.completed'
  | 'return.cancelled';

// Quotation Events
export type QuotationEventType =
  | 'quotation.created'
  | 'quotation.updated'
  | 'quotation.sent'
  | 'quotation.accepted'
  | 'quotation.rejected'
  | 'quotation.converted';

// Saga Lifecycle Events
export type SagaEventType =
  | 'saga.started'
  | 'saga.step.completed'
  | 'saga.step.failed'
  | 'saga.compensating'
  | 'saga.completed'
  | 'saga.failed';

// Combined Event Type
export type EventType =
  | CustomerEventType
  | SupplierEventType
  | ProductEventType
  | InventoryEventType
  | SaleEventType
  | InvoiceEventType
  | PaymentEventType
  | PurchaseEventType
  | ExpenseEventType
  | ReturnEventType
  | QuotationEventType
  | SagaEventType;

// ============= Event Payloads =============

// Customer Payloads
export interface CustomerCreatedPayload {
  customer_id: string;
  name: string;
  email?: string;
}

export interface CustomerCreditUpdatedPayload {
  customer_id: string;
  previous_credit: number;
  new_credit: number;
  reason: string;
}

// Product Payloads
export interface ProductCreatedPayload {
  product_id: string;
  sku: string;
  name: string;
  initial_stock: number;
}

export interface ProductStockUpdatedPayload {
  product_id: string;
  previous_stock: number;
  new_stock: number;
  reason: string;
}

// Inventory Payloads
export interface InventoryCheckRequest {
  items: Array<{
    product_id: string;
    quantity: number;
    product_name?: string;
  }>;
}

export interface InventoryCheckResponse {
  success: boolean;
  available: boolean;
  items: Array<{
    product_id: string;
    requested_quantity: number;
    available_quantity: number;
    is_available: boolean;
  }>;
  errors?: string[];
}

export interface InventoryReserveRequest {
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  ttl_minutes?: number;
}

export interface InventoryReserveResponse {
  success: boolean;
  reservation_id: string;
  items: Array<{
    product_id: string;
    reserved_quantity: number;
  }>;
  expires_at?: Date;
  errors?: string[];
}

export interface InventoryReleaseRequest {
  reservation_id: string;
}

// Sale Payloads
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
  refund_amount?: number;
}

export interface SalePaymentReceivedPayload {
  sale_id: string;
  payment_id: string;
  amount: number;
  new_balance: number;
}

// Invoice Payloads
export interface InvoiceCreatedPayload {
  invoice_id: string;
  invoice_number: string;
  order_id?: string;
  customer_id: string;
  total_amount: number;
}

export interface InvoicePaidPayload {
  invoice_id: string;
  payment_id: string;
  amount_paid: number;
}

// Payment Payloads
export interface PaymentCreatedPayload {
  payment_id: string;
  payment_number: string;
  customer_id: string;
  amount: number;
  method: string;
}

export interface PaymentAllocatedPayload {
  payment_id: string;
  invoice_id?: string;
  order_id?: string;
  amount: number;
}

// Purchase Payloads
export interface PurchaseCreatedPayload {
  purchase_id: string;
  purchase_number: string;
  supplier_id: string;
  total_amount: number;
  items_count: number;
}

export interface PurchaseReceivedPayload {
  purchase_id: string;
  received_items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

// Expense Payloads
export interface ExpenseCreatedPayload {
  expense_id: string;
  expense_number: string;
  category: string;
  amount: number;
}

export interface ExpenseApprovedPayload {
  expense_id: string;
  approved_by?: string;
}

// Return Payloads
export interface ReturnCreatedPayload {
  return_id: string;
  return_number: string;
  sale_id: string;
  customer_id: string;
  items_count: number;
}

export interface ReturnCompletedPayload {
  return_id: string;
  refund_amount: number;
  items_restocked: boolean;
}

// Quotation Payloads
export interface QuotationCreatedPayload {
  quotation_id: string;
  quotation_number: string;
  customer_id: string;
  total_amount: number;
}

export interface QuotationConvertedPayload {
  quotation_id: string;
  sale_id: string;
}

// Saga Payloads
export interface SagaStartedPayload {
  saga_name: string;
  action: string;
  steps: string[];
}

export interface SagaStepCompletedPayload {
  saga_name: string;
  step_name: string;
  step_index: number;
}

export interface SagaCompletedPayload {
  saga_name: string;
  action: string;
  result?: any;
}

export interface SagaFailedPayload {
  saga_name: string;
  action: string;
  errors: string[];
  compensated: boolean;
  failed_step?: string;
}
