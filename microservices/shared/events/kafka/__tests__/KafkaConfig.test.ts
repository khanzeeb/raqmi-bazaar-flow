/**
 * Kafka Configuration Tests
 */

import {
  KafkaConfig,
  EventBridgeConfig,
  createKafkaConfigFromEnv,
  getTopicForEvent,
  getAllTopics,
  EVENT_TOPIC_MAP,
} from '../KafkaConfig';

describe('KafkaConfig', () => {
  describe('createKafkaConfigFromEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should create config with default values', () => {
      delete process.env.KAFKA_BROKERS;
      delete process.env.KAFKA_BROKER;

      const config = createKafkaConfigFromEnv('test-service');

      expect(config.brokers).toEqual(['localhost:9092']);
      expect(config.clientId).toBe('test-service-client');
      expect(config.groupId).toBe('test-service-consumer');
      expect(config.connectionTimeout).toBe(10000);
      expect(config.requestTimeout).toBe(30000);
    });

    it('should use KAFKA_BROKERS environment variable', () => {
      process.env.KAFKA_BROKERS = 'broker1:9092,broker2:9092,broker3:9092';

      const config = createKafkaConfigFromEnv('test-service');

      expect(config.brokers).toEqual(['broker1:9092', 'broker2:9092', 'broker3:9092']);
    });

    it('should use KAFKA_BROKER as fallback', () => {
      process.env.KAFKA_BROKER = 'single-broker:9092';

      const config = createKafkaConfigFromEnv('test-service');

      expect(config.brokers).toEqual(['single-broker:9092']);
    });

    it('should configure SSL when enabled', () => {
      process.env.KAFKA_SSL = 'true';

      const config = createKafkaConfigFromEnv('test-service');

      expect(config.ssl).toBe(true);
    });

    it('should configure SASL when credentials provided', () => {
      process.env.KAFKA_SASL_USERNAME = 'user';
      process.env.KAFKA_SASL_PASSWORD = 'password';
      process.env.KAFKA_SASL_MECHANISM = 'scram-sha-256';

      const config = createKafkaConfigFromEnv('test-service');

      expect(config.sasl).toBeDefined();
      expect(config.sasl?.username).toBe('user');
      expect(config.sasl?.password).toBe('password');
      expect(config.sasl?.mechanism).toBe('scram-sha-256');
    });

    it('should not configure SASL when username not provided', () => {
      delete process.env.KAFKA_SASL_USERNAME;

      const config = createKafkaConfigFromEnv('test-service');

      expect(config.sasl).toBeUndefined();
    });
  });

  describe('getTopicForEvent', () => {
    it('should return correct topic for customer events', () => {
      expect(getTopicForEvent('customer.created')).toBe('customer-events');
      expect(getTopicForEvent('customer.updated')).toBe('customer-events');
      expect(getTopicForEvent('customer.blocked')).toBe('customer-events');
    });

    it('should return correct topic for sale events', () => {
      expect(getTopicForEvent('sale.created')).toBe('order-events');
      expect(getTopicForEvent('sale.completed')).toBe('order-events');
      expect(getTopicForEvent('sale.cancelled')).toBe('order-events');
    });

    it('should return correct topic for inventory events', () => {
      expect(getTopicForEvent('inventory.check.request')).toBe('inventory-commands');
      expect(getTopicForEvent('inventory.check.response')).toBe('inventory-events');
      expect(getTopicForEvent('inventory.reserve.response')).toBe('inventory-events');
    });

    it('should return correct topic for payment events', () => {
      expect(getTopicForEvent('payment.created')).toBe('payment-events');
      expect(getTopicForEvent('payment.completed')).toBe('payment-events');
      expect(getTopicForEvent('payment.allocated')).toBe('payment-events');
    });

    it('should return correct topic for saga events', () => {
      expect(getTopicForEvent('saga.started')).toBe('saga-events');
      expect(getTopicForEvent('saga.completed')).toBe('saga-events');
      expect(getTopicForEvent('saga.failed')).toBe('saga-events');
    });

    it('should return general-events for unknown event types', () => {
      expect(getTopicForEvent('unknown.event')).toBe('general-events');
      expect(getTopicForEvent('custom.event.type')).toBe('general-events');
    });

    it('should apply topic prefix when provided', () => {
      expect(getTopicForEvent('sale.created', 'prod')).toBe('prod.order-events');
      expect(getTopicForEvent('payment.completed', 'staging')).toBe('staging.payment-events');
    });
  });

  describe('getAllTopics', () => {
    it('should return all unique topics', () => {
      const topics = getAllTopics();

      expect(topics).toContain('customer-events');
      expect(topics).toContain('order-events');
      expect(topics).toContain('payment-events');
      expect(topics).toContain('inventory-events');
      expect(topics).toContain('saga-events');
      
      // Should not have duplicates
      expect(new Set(topics).size).toBe(topics.length);
    });

    it('should apply prefix to all topics', () => {
      const topics = getAllTopics('production');

      topics.forEach(topic => {
        expect(topic.startsWith('production.')).toBe(true);
      });
    });

    it('should include all expected topic categories', () => {
      const topics = getAllTopics();

      const expectedTopics = [
        'customer-events',
        'supplier-events',
        'product-events',
        'inventory-events',
        'inventory-commands',
        'order-events',
        'invoice-events',
        'payment-events',
        'purchase-events',
        'expense-events',
        'return-events',
        'quotation-events',
        'saga-events',
      ];

      expectedTopics.forEach(expected => {
        expect(topics).toContain(expected);
      });
    });
  });

  describe('EVENT_TOPIC_MAP', () => {
    it('should have mappings for all customer events', () => {
      const customerEvents = ['customer.created', 'customer.updated', 'customer.deleted', 'customer.credit.updated', 'customer.blocked', 'customer.unblocked'];
      
      customerEvents.forEach(event => {
        expect(EVENT_TOPIC_MAP[event]).toBeDefined();
        expect(EVENT_TOPIC_MAP[event]).toBe('customer-events');
      });
    });

    it('should have mappings for all sale events', () => {
      const saleEvents = ['sale.created', 'sale.updated', 'sale.cancelled', 'sale.completed', 'sale.confirmed', 'sale.payment.received', 'sale.overdue'];
      
      saleEvents.forEach(event => {
        expect(EVENT_TOPIC_MAP[event]).toBeDefined();
        expect(EVENT_TOPIC_MAP[event]).toBe('order-events');
      });
    });

    it('should separate inventory commands from events', () => {
      expect(EVENT_TOPIC_MAP['inventory.check.request']).toBe('inventory-commands');
      expect(EVENT_TOPIC_MAP['inventory.reserve.request']).toBe('inventory-commands');
      expect(EVENT_TOPIC_MAP['inventory.release.request']).toBe('inventory-commands');
      
      expect(EVENT_TOPIC_MAP['inventory.check.response']).toBe('inventory-events');
      expect(EVENT_TOPIC_MAP['inventory.reserve.response']).toBe('inventory-events');
      expect(EVENT_TOPIC_MAP['inventory.release.response']).toBe('inventory-events');
    });
  });
});
