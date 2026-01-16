/**
 * Kafka Event Bridge Configuration
 */

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  connectionTimeout?: number;
  requestTimeout?: number;
  retry?: {
    initialRetryTime?: number;
    retries?: number;
  };
  ssl?: boolean;
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
}

export interface EventBridgeConfig {
  kafka: KafkaConfig;
  serviceName: string;
  publishEvents: string[];      // Events to publish to Kafka
  subscribeEvents: string[];    // Events to subscribe from Kafka
  topicPrefix?: string;         // Prefix for Kafka topics
  enableDeadLetter?: boolean;   // Enable dead letter queue
  batchSize?: number;           // Batch size for publishing
  batchTimeout?: number;        // Batch timeout in ms
}

export const defaultKafkaConfig: Partial<KafkaConfig> = {
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
};

export function createKafkaConfigFromEnv(serviceName: string): KafkaConfig {
  return {
    brokers: (process.env.KAFKA_BROKERS || process.env.KAFKA_BROKER || 'localhost:9092').split(','),
    clientId: `${serviceName}-client`,
    groupId: `${serviceName}-consumer`,
    connectionTimeout: parseInt(process.env.KAFKA_CONNECTION_TIMEOUT || '10000'),
    requestTimeout: parseInt(process.env.KAFKA_REQUEST_TIMEOUT || '30000'),
    ssl: process.env.KAFKA_SSL === 'true',
    sasl: process.env.KAFKA_SASL_USERNAME ? {
      mechanism: (process.env.KAFKA_SASL_MECHANISM as any) || 'plain',
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD || '',
    } : undefined,
  };
}

/**
 * Event to Topic Mapping
 * Maps domain events to Kafka topics
 */
export const EVENT_TOPIC_MAP: Record<string, string> = {
  // Customer events
  'customer.created': 'customer-events',
  'customer.updated': 'customer-events',
  'customer.deleted': 'customer-events',
  'customer.credit.updated': 'customer-events',
  'customer.blocked': 'customer-events',
  'customer.unblocked': 'customer-events',

  // Supplier events
  'supplier.created': 'supplier-events',
  'supplier.updated': 'supplier-events',
  'supplier.deleted': 'supplier-events',

  // Product events
  'product.created': 'product-events',
  'product.updated': 'product-events',
  'product.deleted': 'product-events',
  'product.stock.updated': 'inventory-events',
  'product.low_stock': 'inventory-events',

  // Inventory events
  'inventory.check.request': 'inventory-commands',
  'inventory.check.response': 'inventory-events',
  'inventory.reserve.request': 'inventory-commands',
  'inventory.reserve.response': 'inventory-events',
  'inventory.release.request': 'inventory-commands',
  'inventory.release.response': 'inventory-events',
  'inventory.adjusted': 'inventory-events',
  'inventory.movement.created': 'inventory-events',

  // Sale/Order events
  'sale.created': 'order-events',
  'sale.updated': 'order-events',
  'sale.cancelled': 'order-events',
  'sale.completed': 'order-events',
  'sale.confirmed': 'order-events',
  'sale.payment.received': 'order-events',
  'sale.overdue': 'order-events',

  // Invoice events
  'invoice.created': 'invoice-events',
  'invoice.updated': 'invoice-events',
  'invoice.sent': 'invoice-events',
  'invoice.paid': 'invoice-events',
  'invoice.overdue': 'invoice-events',
  'invoice.cancelled': 'invoice-events',

  // Payment events
  'payment.created': 'payment-events',
  'payment.completed': 'payment-events',
  'payment.allocated': 'payment-events',
  'payment.cancelled': 'payment-events',
  'payment.refunded': 'payment-events',

  // Purchase events
  'purchase.created': 'purchase-events',
  'purchase.updated': 'purchase-events',
  'purchase.received': 'purchase-events',
  'purchase.cancelled': 'purchase-events',
  'purchase.payment.added': 'purchase-events',

  // Expense events
  'expense.created': 'expense-events',
  'expense.updated': 'expense-events',
  'expense.approved': 'expense-events',
  'expense.rejected': 'expense-events',
  'expense.paid': 'expense-events',

  // Return events
  'return.created': 'return-events',
  'return.approved': 'return-events',
  'return.rejected': 'return-events',
  'return.completed': 'return-events',
  'return.cancelled': 'return-events',

  // Quotation events
  'quotation.created': 'quotation-events',
  'quotation.updated': 'quotation-events',
  'quotation.sent': 'quotation-events',
  'quotation.accepted': 'quotation-events',
  'quotation.rejected': 'quotation-events',
  'quotation.converted': 'quotation-events',

  // Saga events
  'saga.started': 'saga-events',
  'saga.step.completed': 'saga-events',
  'saga.step.failed': 'saga-events',
  'saga.compensating': 'saga-events',
  'saga.completed': 'saga-events',
  'saga.failed': 'saga-events',
};

/**
 * Get Kafka topic for an event type
 */
export function getTopicForEvent(eventType: string, prefix?: string): string {
  const topic = EVENT_TOPIC_MAP[eventType] || 'general-events';
  return prefix ? `${prefix}.${topic}` : topic;
}

/**
 * Get all unique topics
 */
export function getAllTopics(prefix?: string): string[] {
  const topics = [...new Set(Object.values(EVENT_TOPIC_MAP))];
  return prefix ? topics.map(t => `${prefix}.${t}`) : topics;
}
