/**
 * Service-specific Kafka Bridge Configurations
 * Pre-configured bridges for each microservice
 */

import { createKafkaEventBridge, KafkaEventBridge } from './KafkaEventBridge';

// ============= Customer Service Bridge =============
export function createCustomerServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'customer-service',
    // Events to publish
    [
      'customer.created',
      'customer.updated',
      'customer.deleted',
      'customer.credit.updated',
      'customer.blocked',
      'customer.unblocked',
      'supplier.created',
      'supplier.updated',
      'supplier.deleted',
    ],
    // Events to subscribe
    [
      'sale.created',
      'sale.completed',
      'sale.cancelled',
      'payment.completed',
      'payment.refunded',
      'invoice.overdue',
      'purchase.created',
      'purchase.received',
    ]
  );
}

// ============= Product Service Bridge =============
export function createProductServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'product-service',
    [
      'product.created',
      'product.updated',
      'product.deleted',
      'product.stock.updated',
      'product.low_stock',
    ],
    [
      'purchase.received',
      'return.completed',
      'sale.created',
      'sale.cancelled',
      'inventory.adjusted',
    ]
  );
}

// ============= Inventory Service Bridge =============
export function createInventoryServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'inventory-service',
    [
      'inventory.check.response',
      'inventory.reserve.response',
      'inventory.release.response',
      'inventory.adjusted',
      'inventory.movement.created',
    ],
    [
      'product.created',
      'product.stock.updated',
      'purchase.received',
      'return.completed',
      'sale.created',
      'sale.cancelled',
      'inventory.check.request',
      'inventory.reserve.request',
      'inventory.release.request',
      'saga.failed',
    ]
  );
}

// ============= Order Service Bridge =============
export function createOrderServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'order-service',
    [
      'sale.created',
      'sale.updated',
      'sale.cancelled',
      'sale.completed',
      'sale.confirmed',
      'sale.payment.received',
      'sale.overdue',
      'saga.started',
      'saga.step.completed',
      'saga.step.failed',
      'saga.completed',
      'saga.failed',
    ],
    [
      'inventory.check.response',
      'inventory.reserve.response',
      'inventory.release.response',
      'payment.completed',
      'payment.allocated',
      'customer.blocked',
      'customer.unblocked',
    ]
  );
}

// ============= Invoice Service Bridge =============
export function createInvoiceServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'invoice-service',
    [
      'invoice.created',
      'invoice.updated',
      'invoice.sent',
      'invoice.paid',
      'invoice.overdue',
      'invoice.cancelled',
    ],
    [
      'sale.created',
      'sale.completed',
      'payment.allocated',
      'payment.completed',
    ]
  );
}

// ============= Payment Service Bridge =============
export function createPaymentServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'payment-service',
    [
      'payment.created',
      'payment.completed',
      'payment.allocated',
      'payment.cancelled',
      'payment.refunded',
    ],
    [
      'invoice.created',
      'invoice.overdue',
      'sale.created',
      'customer.credit.updated',
    ]
  );
}

// ============= Purchase Service Bridge =============
export function createPurchaseServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'purchase-service',
    [
      'purchase.created',
      'purchase.updated',
      'purchase.received',
      'purchase.cancelled',
      'purchase.payment.added',
    ],
    [
      'payment.completed',
      'supplier.updated',
      'supplier.deleted',
      'inventory.adjusted',
    ]
  );
}

// ============= Expense Service Bridge =============
export function createExpenseServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'expense-service',
    [
      'expense.created',
      'expense.updated',
      'expense.approved',
      'expense.rejected',
      'expense.paid',
    ],
    [
      'payment.completed',
    ]
  );
}

// ============= Return Service Bridge =============
export function createReturnServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'return-service',
    [
      'return.created',
      'return.approved',
      'return.rejected',
      'return.completed',
      'return.cancelled',
    ],
    [
      'sale.cancelled',
      'inventory.adjusted',
      'payment.refunded',
    ]
  );
}

// ============= Quotation Service Bridge =============
export function createQuotationServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'quotation-service',
    [
      'quotation.created',
      'quotation.updated',
      'quotation.sent',
      'quotation.accepted',
      'quotation.rejected',
      'quotation.converted',
    ],
    [
      'customer.created',
      'customer.updated',
      'product.updated',
      'product.stock.updated',
    ]
  );
}

// ============= Report Service Bridge =============
export function createReportServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'report-service',
    [], // Report service only listens
    [
      'sale.created',
      'sale.completed',
      'payment.completed',
      'expense.paid',
      'purchase.received',
      'invoice.paid',
      'return.completed',
    ]
  );
}

// ============= Pricing Service Bridge =============
export function createPricingServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'pricing-service',
    [], // Pricing changes emit product.updated
    [
      'product.created',
      'product.updated',
      'product.stock.updated',
      'product.low_stock',
    ]
  );
}

// ============= Settings Service Bridge =============
export function createSettingsServiceBridge(): KafkaEventBridge {
  return createKafkaEventBridge(
    'settings-service',
    [
      'settings.updated',
      'settings.tax.updated',
      'settings.currency.updated',
      'settings.company.updated',
    ] as any[],
    [] // Settings service only publishes
  );
}

// ============= Bridge Factory Map =============
export const SERVICE_BRIDGE_FACTORIES: Record<string, () => KafkaEventBridge> = {
  'customer-service': createCustomerServiceBridge,
  'product-service': createProductServiceBridge,
  'inventory-service': createInventoryServiceBridge,
  'order-service': createOrderServiceBridge,
  'invoice-service': createInvoiceServiceBridge,
  'payment-service': createPaymentServiceBridge,
  'purchase-service': createPurchaseServiceBridge,
  'expense-service': createExpenseServiceBridge,
  'return-service': createReturnServiceBridge,
  'quotation-service': createQuotationServiceBridge,
  'report-service': createReportServiceBridge,
  'pricing-service': createPricingServiceBridge,
  'settings-service': createSettingsServiceBridge,
};

/**
 * Create a Kafka bridge for a specific service
 */
export function createServiceBridge(serviceName: string): KafkaEventBridge | null {
  const factory = SERVICE_BRIDGE_FACTORIES[serviceName];
  return factory ? factory() : null;
}
