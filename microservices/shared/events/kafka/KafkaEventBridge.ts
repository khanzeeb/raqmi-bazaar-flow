/**
 * Kafka Event Bridge
 * Bridges local EventEmitter events with Kafka for cross-service communication
 */

import { Kafka, Producer, Consumer, EachMessagePayload, logLevel, CompressionTypes } from 'kafkajs';
import { ServiceEventEmitter, createEventEmitter } from '../EventEmitter';
import { EventType, EventPayload } from '../types';
import { 
  KafkaConfig, 
  EventBridgeConfig, 
  getTopicForEvent, 
  getAllTopics,
  createKafkaConfigFromEnv 
} from './KafkaConfig';

export interface KafkaMessage {
  eventType: string;
  payload: EventPayload;
  metadata: {
    source: string;
    publishedAt: Date;
    correlationId: string;
  };
}

export interface BridgeStats {
  published: number;
  received: number;
  errors: number;
  lastPublished?: Date;
  lastReceived?: Date;
}

export class KafkaEventBridge {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private eventEmitter: ServiceEventEmitter;
  private config: EventBridgeConfig;
  private isConnected: boolean = false;
  private isProducerReady: boolean = false;
  private isConsumerReady: boolean = false;
  private stats: BridgeStats = { published: 0, received: 0, errors: 0 };
  private messageBuffer: Array<{ topic: string; messages: any[] }> = [];
  private flushInterval?: NodeJS.Timeout;

  constructor(config: EventBridgeConfig) {
    this.config = config;
    this.eventEmitter = createEventEmitter(config.serviceName);

    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      connectionTimeout: config.kafka.connectionTimeout,
      requestTimeout: config.kafka.requestTimeout,
      retry: config.kafka.retry,
      ssl: config.kafka.ssl,
      sasl: config.kafka.sasl,
      logLevel: logLevel.WARN,
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });

    this.consumer = this.kafka.consumer({
      groupId: config.kafka.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  /**
   * Connect to Kafka and start bridging events
   */
  async connect(): Promise<void> {
    try {
      console.log(`[${this.config.serviceName}] Connecting to Kafka...`);

      // Connect producer
      await this.producer.connect();
      this.isProducerReady = true;
      console.log(`[${this.config.serviceName}] Kafka producer connected`);

      // Connect consumer
      await this.consumer.connect();
      this.isConsumerReady = true;
      console.log(`[${this.config.serviceName}] Kafka consumer connected`);

      // Subscribe to topics
      await this.subscribeToTopics();

      // Start consuming messages
      await this.startConsuming();

      // Setup local event forwarding to Kafka
      this.setupEventForwarding();

      // Start batch flush interval
      if (this.config.batchSize && this.config.batchSize > 1) {
        this.flushInterval = setInterval(() => this.flushBuffer(), this.config.batchTimeout || 100);
      }

      this.isConnected = true;
      console.log(`[${this.config.serviceName}] Kafka event bridge connected`);
    } catch (error) {
      console.error(`[${this.config.serviceName}] Failed to connect to Kafka:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from Kafka
   */
  async disconnect(): Promise<void> {
    try {
      if (this.flushInterval) {
        clearInterval(this.flushInterval);
      }

      // Flush remaining messages
      await this.flushBuffer();

      await this.consumer.disconnect();
      await this.producer.disconnect();
      
      this.isConnected = false;
      this.isProducerReady = false;
      this.isConsumerReady = false;
      
      console.log(`[${this.config.serviceName}] Kafka event bridge disconnected`);
    } catch (error) {
      console.error(`[${this.config.serviceName}] Error disconnecting from Kafka:`, error);
    }
  }

  /**
   * Publish an event to Kafka
   */
  async publish(eventType: string, payload: EventPayload): Promise<void> {
    if (!this.isProducerReady) {
      console.warn(`[${this.config.serviceName}] Producer not ready, event not published: ${eventType}`);
      return;
    }

    const topic = getTopicForEvent(eventType, this.config.topicPrefix);
    const message: KafkaMessage = {
      eventType,
      payload,
      metadata: {
        source: this.config.serviceName,
        publishedAt: new Date(),
        correlationId: payload.correlationId,
      },
    };

    const kafkaMessage = {
      key: payload.correlationId,
      value: JSON.stringify(message),
      headers: {
        'event-type': eventType,
        'source': this.config.serviceName,
        'correlation-id': payload.correlationId,
      },
    };

    // Use batching if configured
    if (this.config.batchSize && this.config.batchSize > 1) {
      this.addToBuffer(topic, kafkaMessage);
    } else {
      await this.sendMessage(topic, kafkaMessage);
    }
  }

  /**
   * Get bridge statistics
   */
  getStats(): BridgeStats {
    return { ...this.stats };
  }

  /**
   * Check if bridge is connected
   */
  isReady(): boolean {
    return this.isConnected && this.isProducerReady && this.isConsumerReady;
  }

  /**
   * Get the local event emitter
   */
  getEventEmitter(): ServiceEventEmitter {
    return this.eventEmitter;
  }

  // ============= Private Methods =============

  private async subscribeToTopics(): Promise<void> {
    // Get unique topics for subscribed events
    const topics = new Set<string>();
    
    for (const eventType of this.config.subscribeEvents) {
      const topic = getTopicForEvent(eventType, this.config.topicPrefix);
      topics.add(topic);
    }

    // Subscribe to all topics
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      console.log(`[${this.config.serviceName}] Subscribed to Kafka topic: ${topic}`);
    }
  }

  private async startConsuming(): Promise<void> {
    await this.consumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        await this.handleMessage(messagePayload);
      },
    });
  }

  private async handleMessage(messagePayload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = messagePayload;

    try {
      if (!message.value) return;

      const kafkaMessage: KafkaMessage = JSON.parse(message.value.toString());
      const { eventType, payload, metadata } = kafkaMessage;

      // Skip if this message came from this service (avoid loops)
      if (metadata.source === this.config.serviceName) {
        return;
      }

      // Check if we're interested in this event
      if (!this.config.subscribeEvents.includes(eventType)) {
        return;
      }

      // Emit the event locally
      this.eventEmitter.emitEvent(
        eventType as EventType,
        payload.data,
        payload.correlationId
      );

      this.stats.received++;
      this.stats.lastReceived = new Date();

      console.log(`[${this.config.serviceName}] Received ${eventType} from ${metadata.source}`);
    } catch (error) {
      this.stats.errors++;
      console.error(`[${this.config.serviceName}] Error processing Kafka message:`, error);

      // Send to dead letter queue if enabled
      if (this.config.enableDeadLetter) {
        await this.sendToDeadLetter(topic, message, error);
      }
    }
  }

  private setupEventForwarding(): void {
    // Subscribe to all events that should be published
    for (const eventType of this.config.publishEvents) {
      this.eventEmitter.onEvent(eventType as EventType, async (payload) => {
        // Only forward if the event originated from this service
        if (payload.source === this.config.serviceName) {
          await this.publish(eventType, payload);
        }
      });
    }

    console.log(`[${this.config.serviceName}] Event forwarding configured for ${this.config.publishEvents.length} event types`);
  }

  private addToBuffer(topic: string, message: any): void {
    let topicBuffer = this.messageBuffer.find(b => b.topic === topic);
    if (!topicBuffer) {
      topicBuffer = { topic, messages: [] };
      this.messageBuffer.push(topicBuffer);
    }
    topicBuffer.messages.push(message);

    // Flush if buffer is full
    if (topicBuffer.messages.length >= (this.config.batchSize || 100)) {
      this.flushBuffer();
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.messageBuffer.length === 0) return;

    const bufferToSend = [...this.messageBuffer];
    this.messageBuffer = [];

    for (const { topic, messages } of bufferToSend) {
      if (messages.length > 0) {
        try {
          await this.producer.send({
            topic,
            messages,
            compression: CompressionTypes.GZIP,
          });
          this.stats.published += messages.length;
          this.stats.lastPublished = new Date();
        } catch (error) {
          this.stats.errors++;
          console.error(`[${this.config.serviceName}] Error flushing buffer to ${topic}:`, error);
          // Re-add to buffer for retry
          this.messageBuffer.push({ topic, messages });
        }
      }
    }
  }

  private async sendMessage(topic: string, message: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [message],
      });
      this.stats.published++;
      this.stats.lastPublished = new Date();
    } catch (error) {
      this.stats.errors++;
      console.error(`[${this.config.serviceName}] Error publishing to ${topic}:`, error);
      throw error;
    }
  }

  private async sendToDeadLetter(originalTopic: string, message: any, error: any): Promise<void> {
    const dlqTopic = `${this.config.topicPrefix || ''}.dead-letter`;
    try {
      await this.producer.send({
        topic: dlqTopic,
        messages: [{
          key: message.key,
          value: JSON.stringify({
            originalTopic,
            originalMessage: message.value?.toString(),
            error: error?.message || String(error),
            failedAt: new Date().toISOString(),
            service: this.config.serviceName,
          }),
        }],
      });
    } catch (dlqError) {
      console.error(`[${this.config.serviceName}] Failed to send to DLQ:`, dlqError);
    }
  }
}

/**
 * Factory function to create a Kafka event bridge
 */
export function createKafkaEventBridge(
  serviceName: string,
  publishEvents: string[],
  subscribeEvents: string[],
  options?: Partial<EventBridgeConfig>
): KafkaEventBridge {
  const config: EventBridgeConfig = {
    kafka: createKafkaConfigFromEnv(serviceName),
    serviceName,
    publishEvents,
    subscribeEvents,
    topicPrefix: options?.topicPrefix || process.env.KAFKA_TOPIC_PREFIX,
    enableDeadLetter: options?.enableDeadLetter ?? true,
    batchSize: options?.batchSize,
    batchTimeout: options?.batchTimeout,
  };

  return new KafkaEventBridge(config);
}
