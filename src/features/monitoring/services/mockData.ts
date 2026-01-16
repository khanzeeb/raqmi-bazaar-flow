/**
 * Mock data for monitoring dashboard when backend is unavailable
 */

import type { 
  AggregatedDashboard, 
  ServiceHealth, 
  AggregatedEvent, 
  EventMetrics,
  EventFlowData,
  KafkaStatus 
} from '../types';

const SERVICES = [
  'product-service',
  'order-service',
  'customer-service',
  'quotation-service',
  'purchase-service',
  'expense-service',
  'invoice-service',
  'report-service',
  'pricing-service',
  'return-service',
  'inventory-service',
  'settings-service',
];

const EVENT_TYPES = [
  'ProductCreated',
  'ProductUpdated',
  'OrderCreated',
  'OrderCompleted',
  'OrderCancelled',
  'CustomerCreated',
  'CustomerUpdated',
  'InvoiceGenerated',
  'PaymentReceived',
  'InventoryUpdated',
  'QuotationCreated',
  'PurchaseOrderCreated',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStatus(): 'OK' | 'ERROR' | 'TIMEOUT' {
  const rand = Math.random();
  if (rand > 0.9) return 'ERROR';
  if (rand > 0.85) return 'TIMEOUT';
  return 'OK';
}

function generateServiceHealth(): ServiceHealth[] {
  return SERVICES.map((service) => {
    const status = randomStatus();
    return {
      service,
      status,
      timestamp: new Date().toISOString(),
      events: {
        subscriptions: randomInt(3, 12),
        registered: randomInt(5, 20),
      },
      kafka: {
        enabled: true,
        connected: status === 'OK',
        stats: {
          published: randomInt(100, 5000),
          received: randomInt(100, 5000),
          errors: status === 'OK' ? randomInt(0, 5) : randomInt(10, 50),
          lastPublished: new Date(Date.now() - randomInt(1000, 60000)).toISOString(),
          lastReceived: new Date(Date.now() - randomInt(1000, 60000)).toISOString(),
        },
      },
      responseTime: status === 'TIMEOUT' ? randomInt(5000, 10000) : randomInt(10, 200),
      error: status === 'ERROR' ? 'Connection refused' : undefined,
    };
  });
}

function generateRecentEvents(count: number = 25): AggregatedEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `event-${Date.now()}-${i}`,
    service: SERVICES[randomInt(0, SERVICES.length - 1)],
    eventType: EVENT_TYPES[randomInt(0, EVENT_TYPES.length - 1)],
    timestamp: new Date(Date.now() - randomInt(1000, 3600000)).toISOString(),
    payload: {
      id: `item-${randomInt(1000, 9999)}`,
      amount: randomInt(100, 10000),
    },
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateEventFlow(): EventFlowData {
  const serviceNodes = SERVICES.map((service) => ({
    id: service,
    label: service.replace('-service', '').replace(/^\w/, c => c.toUpperCase()),
    type: 'service' as const,
    status: randomStatus() === 'OK' ? 'healthy' as const : 'unhealthy' as const,
    metrics: {
      published: randomInt(100, 2000),
      received: randomInt(100, 2000),
      subscriptions: randomInt(3, 15),
    },
  }));

  const topicNodes = [
    'orders',
    'products',
    'customers',
    'inventory',
    'payments',
  ].map((topic) => ({
    id: `topic-${topic}`,
    label: topic,
    type: 'topic' as const,
    status: 'healthy' as const,
    metrics: {
      published: randomInt(500, 5000),
      received: randomInt(500, 5000),
      subscriptions: randomInt(5, 20),
    },
  }));

  const edges = [
    { source: 'order-service', target: 'topic-orders', label: 'publishes', weight: randomInt(100, 500) },
    { source: 'topic-orders', target: 'inventory-service', label: 'subscribes', weight: randomInt(100, 500) },
    { source: 'topic-orders', target: 'invoice-service', label: 'subscribes', weight: randomInt(100, 500) },
    { source: 'product-service', target: 'topic-products', label: 'publishes', weight: randomInt(100, 500) },
    { source: 'topic-products', target: 'pricing-service', label: 'subscribes', weight: randomInt(100, 500) },
    { source: 'customer-service', target: 'topic-customers', label: 'publishes', weight: randomInt(100, 500) },
    { source: 'inventory-service', target: 'topic-inventory', label: 'publishes', weight: randomInt(100, 500) },
    { source: 'topic-inventory', target: 'order-service', label: 'subscribes', weight: randomInt(50, 300) },
  ].map((e, i) => ({ ...e, id: `edge-${i}` }));

  return {
    nodes: [...serviceNodes, ...topicNodes],
    edges,
  };
}

export function generateMockDashboard(): AggregatedDashboard {
  const services = generateServiceHealth();
  const healthyCount = services.filter(s => s.status === 'OK').length;
  const kafkaConnected = services.filter(s => s.kafka?.connected).length;
  const totalSubscriptions = services.reduce((sum, s) => sum + (s.events?.subscriptions || 0), 0);
  const totalEvents = services.reduce((sum, s) => sum + (s.kafka?.stats?.published || 0) + (s.kafka?.stats?.received || 0), 0);

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalServices: services.length,
      healthyServices: healthyCount,
      unhealthyServices: services.length - healthyCount,
      totalSubscriptions,
      totalEventsProcessed: totalEvents,
      kafkaConnected,
    },
    services,
    eventFlow: generateEventFlow(),
    recentEvents: generateRecentEvents(),
  };
}

export function generateMockEventMetrics(): EventMetrics[] {
  return EVENT_TYPES.map((eventType) => ({
    eventType,
    count: randomInt(50, 2000),
    lastOccurrence: new Date(Date.now() - randomInt(1000, 3600000)).toISOString(),
    sources: SERVICES.slice(0, randomInt(1, 4)),
  })).sort((a, b) => b.count - a.count);
}

export function generateMockKafkaStatus(): KafkaStatus {
  const services = SERVICES.map((service) => ({
    service,
    kafka: {
      enabled: true,
      connected: Math.random() > 0.15,
      stats: {
        published: randomInt(100, 5000),
        received: randomInt(100, 5000),
        errors: randomInt(0, 20),
      },
    },
  }));

  return {
    services,
    summary: {
      total: services.length,
      connected: services.filter(s => s.kafka.connected).length,
      disconnected: services.filter(s => !s.kafka.connected).length,
    },
  };
}
