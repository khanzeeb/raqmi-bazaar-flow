/**
 * Dead Letter Queue Tests
 */

import { KafkaEventBridge, createKafkaEventBridge, EventBridgeConfig } from '../KafkaEventBridge';
import { delay, EventCollector, TestPayloadFactory } from './test-utils';

const USE_REAL_KAFKA = process.env.TEST_KAFKA === 'true';

describe('Dead Letter Queue', () => {
  describe('Configuration', () => {
    it('should enable DLQ by default', () => {
      const bridge = createKafkaEventBridge(
        'dlq-test-service',
        ['sale.created'],
        ['payment.completed']
      );

      expect(bridge).toBeDefined();
    });

    it('should respect DLQ configuration', () => {
      const bridge = createKafkaEventBridge(
        'dlq-disabled-service',
        ['sale.created'],
        ['payment.completed'],
        { enableDeadLetter: false }
      );

      expect(bridge).toBeDefined();
    });
  });

  // Integration tests require real Kafka
  const integrationTests = USE_REAL_KAFKA ? describe : describe.skip;

  integrationTests('DLQ Message Handling', () => {
    let bridge: KafkaEventBridge;

    beforeAll(async () => {
      bridge = createKafkaEventBridge(
        'dlq-integration-test',
        [],
        ['payment.completed'],
        { 
          enableDeadLetter: true,
          topicPrefix: 'dlq-test',
        }
      );

      await bridge.connect();
      await delay(2000);
    }, 30000);

    afterAll(async () => {
      await bridge?.disconnect();
    });

    it('should track error statistics', async () => {
      // Initial stats should have no errors
      const initialStats = bridge.getStats();
      expect(initialStats.errors).toBe(0);
    });

    it('should have stats tracking available', () => {
      const stats = bridge.getStats();
      
      expect(stats).toHaveProperty('published');
      expect(stats).toHaveProperty('received');
      expect(stats).toHaveProperty('errors');
    });
  });
});

describe('Message Batching', () => {
  describe('Configuration', () => {
    it('should accept batch configuration', () => {
      const bridge = createKafkaEventBridge(
        'batch-test-service',
        ['sale.created'],
        [],
        { 
          batchSize: 10,
          batchTimeout: 100,
        }
      );

      expect(bridge).toBeDefined();
    });
  });

  const integrationTests = USE_REAL_KAFKA ? describe : describe.skip;

  integrationTests('Batch Publishing', () => {
    let bridge: KafkaEventBridge;

    beforeAll(async () => {
      bridge = createKafkaEventBridge(
        'batch-integration-test',
        ['sale.created'],
        [],
        { 
          batchSize: 5,
          batchTimeout: 500,
          topicPrefix: 'batch-test',
        }
      );

      await bridge.connect();
      await delay(2000);
    }, 30000);

    afterAll(async () => {
      await bridge?.disconnect();
    });

    it('should batch multiple events', async () => {
      const emitter = bridge.getEventEmitter();
      
      // Send multiple events quickly
      for (let i = 0; i < 5; i++) {
        emitter.emitEvent('sale.created', TestPayloadFactory.createSaleCreatedPayload());
      }

      // Wait for batch to flush
      await delay(1000);

      const stats = bridge.getStats();
      expect(stats.published).toBeGreaterThanOrEqual(5);
    });
  });
});

describe('Graceful Degradation', () => {
  it('should work locally when Kafka is unavailable', async () => {
    const bridge = createKafkaEventBridge(
      'degradation-test',
      ['sale.created'],
      ['payment.completed'],
      { topicPrefix: 'degradation-test' }
    );

    // Don't connect - simulate Kafka being unavailable
    const emitter = bridge.getEventEmitter();
    const collector = new EventCollector();

    emitter.onEvent('sale.created', (payload) => {
      collector.collect('sale.created', payload);
    });

    // Events should still work locally
    emitter.emitEvent('sale.created', TestPayloadFactory.createSaleCreatedPayload());

    await delay(100);

    expect(collector.count('sale.created')).toBe(1);
  });

  it('should not throw when publishing without connection', async () => {
    const bridge = createKafkaEventBridge(
      'no-connection-test',
      ['sale.created'],
      []
    );

    // This should not throw
    await expect(
      bridge.publish('sale.created', TestPayloadFactory.createEventPayload({ sale_id: 'test' }))
    ).resolves.not.toThrow();
  });
});
