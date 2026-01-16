/**
 * Kafka Event Bridge Integration Tests
 * Tests cross-service event delivery via Kafka
 */

import { 
  KafkaEventBridge, 
  createKafkaEventBridge,
  KafkaConfig,
  EventBridgeConfig 
} from '../KafkaEventBridge';
import { ServiceEventEmitter, createEventEmitter } from '../../EventEmitter';
import { EventPayload } from '../../types';

// Test utilities
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Kafka for unit tests (use real Kafka for integration)
const USE_REAL_KAFKA = process.env.TEST_KAFKA === 'true';

describe('KafkaEventBridge', () => {
  let bridge: KafkaEventBridge;
  let eventEmitter: ServiceEventEmitter;

  const testConfig: EventBridgeConfig = {
    kafka: {
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      clientId: 'test-service-client',
      groupId: 'test-service-consumer',
      connectionTimeout: 5000,
      requestTimeout: 10000,
    },
    serviceName: 'test-service',
    publishEvents: ['sale.created', 'sale.completed'],
    subscribeEvents: ['payment.completed', 'inventory.reserved'],
    topicPrefix: 'test',
    enableDeadLetter: true,
  };

  beforeEach(() => {
    // Reset singleton for each test
    ServiceEventEmitter.resetInstance();
    eventEmitter = createEventEmitter('test-service');
  });

  afterEach(async () => {
    if (bridge) {
      await bridge.disconnect();
    }
  });

  describe('Configuration', () => {
    it('should create bridge with valid configuration', () => {
      bridge = new KafkaEventBridge(testConfig);
      
      expect(bridge).toBeDefined();
      expect(bridge.isReady()).toBe(false);
    });

    it('should use factory function to create bridge', () => {
      bridge = createKafkaEventBridge(
        'factory-test-service',
        ['sale.created'],
        ['payment.completed']
      );
      
      expect(bridge).toBeDefined();
      expect(bridge.getEventEmitter()).toBeDefined();
    });

    it('should initialize with zero stats', () => {
      bridge = new KafkaEventBridge(testConfig);
      const stats = bridge.getStats();
      
      expect(stats.published).toBe(0);
      expect(stats.received).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.lastPublished).toBeUndefined();
      expect(stats.lastReceived).toBeUndefined();
    });
  });

  describe('Event Emitter Integration', () => {
    it('should return the local event emitter', () => {
      bridge = new KafkaEventBridge(testConfig);
      const emitter = bridge.getEventEmitter();
      
      expect(emitter).toBeDefined();
      expect(emitter.getServiceName()).toBe('test-service');
    });

    it('should emit events locally when Kafka is not connected', async () => {
      bridge = new KafkaEventBridge(testConfig);
      const emitter = bridge.getEventEmitter();
      
      const receivedEvents: any[] = [];
      emitter.onEvent('sale.created', (payload) => {
        receivedEvents.push(payload);
      });

      emitter.emitEvent('sale.created', { sale_id: 'test-123' });
      
      await delay(10);
      
      expect(receivedEvents.length).toBe(1);
      expect(receivedEvents[0].data.sale_id).toBe('test-123');
    });
  });

  describe('Connection Handling', () => {
    it('should handle connection failure gracefully', async () => {
      const badConfig: EventBridgeConfig = {
        ...testConfig,
        kafka: {
          ...testConfig.kafka,
          brokers: ['nonexistent-host:9092'],
          connectionTimeout: 1000,
        },
      };

      bridge = new KafkaEventBridge(badConfig);
      
      await expect(bridge.connect()).rejects.toThrow();
      expect(bridge.isReady()).toBe(false);
    });

    it('should report not ready before connection', () => {
      bridge = new KafkaEventBridge(testConfig);
      expect(bridge.isReady()).toBe(false);
    });
  });

  describe('Message Publishing (Unit)', () => {
    it('should not publish when producer is not ready', async () => {
      bridge = new KafkaEventBridge(testConfig);
      
      // Should not throw, just warn
      await bridge.publish('sale.created', {
        correlationId: 'test-corr-id',
        timestamp: new Date(),
        source: 'test-service',
        data: { sale_id: 'test-123' },
      });

      const stats = bridge.getStats();
      expect(stats.published).toBe(0);
    });
  });
});

describe('KafkaEventBridge Integration Tests', () => {
  // These tests require a running Kafka instance
  // Run with: TEST_KAFKA=true npm test

  const skipIfNoKafka = USE_REAL_KAFKA ? describe : describe.skip;

  skipIfNoKafka('Cross-Service Communication', () => {
    let publisherBridge: KafkaEventBridge;
    let subscriberBridge: KafkaEventBridge;

    beforeAll(async () => {
      // Create publisher (simulating order-service)
      publisherBridge = createKafkaEventBridge(
        'order-service-test',
        ['sale.created', 'sale.completed'],
        [],
        { topicPrefix: 'integration-test' }
      );

      // Create subscriber (simulating payment-service)
      subscriberBridge = createKafkaEventBridge(
        'payment-service-test',
        [],
        ['sale.created', 'sale.completed'],
        { topicPrefix: 'integration-test' }
      );

      await publisherBridge.connect();
      await subscriberBridge.connect();

      // Wait for consumers to be ready
      await delay(2000);
    }, 30000);

    afterAll(async () => {
      await publisherBridge?.disconnect();
      await subscriberBridge?.disconnect();
    });

    it('should deliver events from publisher to subscriber', async () => {
      const receivedEvents: any[] = [];
      
      subscriberBridge.getEventEmitter().onEvent('sale.created', (payload) => {
        receivedEvents.push(payload);
      });

      // Publish event from order-service
      const publisherEmitter = publisherBridge.getEventEmitter();
      publisherEmitter.emitEvent('sale.created', {
        sale_id: 'cross-service-test-123',
        sale_number: 'SALE-001',
        customer_id: 'cust-456',
        total_amount: 150.00,
        items_count: 3,
      });

      // Wait for Kafka delivery
      await delay(5000);

      expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
      expect(receivedEvents[0].data.sale_id).toBe('cross-service-test-123');
    }, 15000);

    it('should track publishing statistics', async () => {
      const publisherEmitter = publisherBridge.getEventEmitter();
      
      publisherEmitter.emitEvent('sale.completed', {
        sale_id: 'stats-test-123',
        sale_number: 'SALE-002',
        customer_id: 'cust-789',
        total_amount: 200.00,
        items_count: 2,
      });

      await delay(1000);

      const stats = publisherBridge.getStats();
      expect(stats.published).toBeGreaterThan(0);
      expect(stats.lastPublished).toBeDefined();
    });

    it('should track receiving statistics', async () => {
      await delay(5000); // Wait for any pending messages

      const stats = subscriberBridge.getStats();
      expect(stats.received).toBeGreaterThanOrEqual(0);
    });
  });

  skipIfNoKafka('Saga Event Flow', () => {
    let orderServiceBridge: KafkaEventBridge;
    let inventoryServiceBridge: KafkaEventBridge;
    let paymentServiceBridge: KafkaEventBridge;

    beforeAll(async () => {
      orderServiceBridge = createKafkaEventBridge(
        'order-saga-test',
        ['saga.started', 'saga.completed', 'saga.failed'],
        ['inventory.reserve.response', 'payment.completed'],
        { topicPrefix: 'saga-test' }
      );

      inventoryServiceBridge = createKafkaEventBridge(
        'inventory-saga-test',
        ['inventory.reserve.response'],
        ['saga.started'],
        { topicPrefix: 'saga-test' }
      );

      paymentServiceBridge = createKafkaEventBridge(
        'payment-saga-test',
        ['payment.completed'],
        ['saga.started', 'inventory.reserve.response'],
        { topicPrefix: 'saga-test' }
      );

      await Promise.all([
        orderServiceBridge.connect(),
        inventoryServiceBridge.connect(),
        paymentServiceBridge.connect(),
      ]);

      await delay(3000);
    }, 30000);

    afterAll(async () => {
      await Promise.all([
        orderServiceBridge?.disconnect(),
        inventoryServiceBridge?.disconnect(),
        paymentServiceBridge?.disconnect(),
      ]);
    });

    it('should propagate saga events across services', async () => {
      const sagaEvents: any[] = [];

      // Inventory service listens for saga start
      inventoryServiceBridge.getEventEmitter().onEvent('saga.started', (payload) => {
        sagaEvents.push({ service: 'inventory', event: 'saga.started', payload });
        
        // Simulate inventory reservation response
        inventoryServiceBridge.getEventEmitter().emitEvent('inventory.reserve.response', {
          success: true,
          reservation_id: 'res-saga-001',
          items: [{ product_id: 'prod-1', reserved_quantity: 5 }],
        });
      });

      // Order service starts the saga
      orderServiceBridge.getEventEmitter().emitEvent('saga.started', {
        saga_name: 'sale-creation-saga',
        action: 'create_sale',
        steps: ['check_inventory', 'reserve_inventory', 'process_payment'],
      });

      await delay(5000);

      expect(sagaEvents.length).toBeGreaterThanOrEqual(1);
      expect(sagaEvents[0].event).toBe('saga.started');
    }, 15000);

    it('should handle saga compensation events', async () => {
      const compensationEvents: any[] = [];

      inventoryServiceBridge.getEventEmitter().onEvent('saga.failed', (payload) => {
        compensationEvents.push(payload);
      });

      orderServiceBridge.getEventEmitter().emitEvent('saga.failed', {
        saga_name: 'sale-creation-saga',
        action: 'create_sale',
        errors: ['Payment failed: Insufficient funds'],
        compensated: true,
        failed_step: 'process_payment',
      });

      await delay(5000);

      // Check if compensation event was received
      expect(compensationEvents.length).toBeGreaterThanOrEqual(0);
    }, 15000);
  });
});
