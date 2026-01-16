/**
 * Test Utilities for Kafka Event Bridge Tests
 */

import { EventPayload, SaleCreatedPayload, PaymentCreatedPayload, InventoryReserveResponse } from '../../types';

/**
 * Delay utility
 */
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wait for condition with timeout
 */
export const waitFor = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true;
    }
    await delay(interval);
  }
  
  return false;
};

/**
 * Event collector for testing
 */
export class EventCollector {
  private events: Array<{ type: string; payload: any; timestamp: Date }> = [];

  collect(type: string, payload: any): void {
    this.events.push({ type, payload, timestamp: new Date() });
  }

  getEvents(type?: string): Array<{ type: string; payload: any; timestamp: Date }> {
    if (type) {
      return this.events.filter(e => e.type === type);
    }
    return [...this.events];
  }

  count(type?: string): number {
    return this.getEvents(type).length;
  }

  clear(): void {
    this.events = [];
  }

  async waitForEvent(type: string, timeout: number = 5000): Promise<any | null> {
    const found = await waitFor(() => this.count(type) > 0, timeout);
    return found ? this.getEvents(type)[0]?.payload : null;
  }

  async waitForEventCount(type: string, count: number, timeout: number = 5000): Promise<boolean> {
    return waitFor(() => this.count(type) >= count, timeout);
  }
}

/**
 * Test payload factories
 */
export class TestPayloadFactory {
  private static counter = 0;

  static createSaleCreatedPayload(overrides?: Partial<SaleCreatedPayload>): SaleCreatedPayload {
    this.counter++;
    return {
      sale_id: `test-sale-${this.counter}`,
      sale_number: `SALE-TEST-${this.counter}`,
      customer_id: `test-customer-${this.counter}`,
      total_amount: 100.00 + this.counter,
      items_count: 1,
      ...overrides,
    };
  }

  static createPaymentPayload(overrides?: Partial<PaymentCreatedPayload>): PaymentCreatedPayload {
    this.counter++;
    return {
      payment_id: `test-payment-${this.counter}`,
      payment_number: `PAY-TEST-${this.counter}`,
      customer_id: `test-customer-${this.counter}`,
      amount: 100.00 + this.counter,
      method: 'credit_card',
      ...overrides,
    };
  }

  static createInventoryReserveResponse(overrides?: Partial<InventoryReserveResponse>): InventoryReserveResponse {
    this.counter++;
    return {
      success: true,
      reservation_id: `test-res-${this.counter}`,
      items: [
        { product_id: `test-prod-${this.counter}`, reserved_quantity: 5 },
      ],
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
      ...overrides,
    };
  }

  static createEventPayload<T>(data: T, source: string = 'test-service'): EventPayload<T> {
    return {
      correlationId: `test-corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      source,
      data,
    };
  }

  static reset(): void {
    this.counter = 0;
  }
}

/**
 * Mock Kafka producer for unit tests
 */
export class MockKafkaProducer {
  public isConnected = false;
  public sentMessages: Array<{ topic: string; messages: any[] }> = [];

  async connect(): Promise<void> {
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async send(record: { topic: string; messages: any[] }): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Producer not connected');
    }
    this.sentMessages.push(record);
  }

  getSentMessages(topic?: string): any[] {
    if (topic) {
      return this.sentMessages.filter(m => m.topic === topic).flatMap(m => m.messages);
    }
    return this.sentMessages.flatMap(m => m.messages);
  }

  clear(): void {
    this.sentMessages = [];
  }
}

/**
 * Mock Kafka consumer for unit tests
 */
export class MockKafkaConsumer {
  public isConnected = false;
  public subscribedTopics: string[] = [];
  private messageHandler?: (payload: any) => Promise<void>;

  async connect(): Promise<void> {
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async subscribe(config: { topic: string }): Promise<void> {
    this.subscribedTopics.push(config.topic);
  }

  async run(config: { eachMessage: (payload: any) => Promise<void> }): Promise<void> {
    this.messageHandler = config.eachMessage;
  }

  async simulateMessage(topic: string, message: any): Promise<void> {
    if (this.messageHandler && this.subscribedTopics.includes(topic)) {
      await this.messageHandler({
        topic,
        partition: 0,
        message: {
          key: message.key,
          value: Buffer.from(JSON.stringify(message.value)),
          headers: message.headers,
        },
      });
    }
  }
}

/**
 * Test environment setup
 */
export function setupTestEnvironment(): void {
  // Set test environment variables
  process.env.KAFKA_ENABLED = 'false';
  process.env.NODE_ENV = 'test';
}

/**
 * Check if real Kafka is available
 */
export function isKafkaAvailable(): boolean {
  return process.env.TEST_KAFKA === 'true';
}
