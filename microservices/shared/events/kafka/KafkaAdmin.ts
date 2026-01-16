/**
 * Kafka Admin Utilities
 * Utilities for managing Kafka topics and infrastructure
 */

import { Kafka, Admin, ITopicConfig } from 'kafkajs';
import { KafkaConfig, getAllTopics, createKafkaConfigFromEnv } from './KafkaConfig';

export interface TopicConfig {
  topic: string;
  numPartitions?: number;
  replicationFactor?: number;
  configEntries?: Array<{ name: string; value: string }>;
}

export class KafkaAdmin {
  private kafka: Kafka;
  private admin: Admin;
  private isConnected: boolean = false;

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: `${config.clientId}-admin`,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.sasl,
    });
    this.admin = this.kafka.admin();
  }

  /**
   * Connect to Kafka admin
   */
  async connect(): Promise<void> {
    await this.admin.connect();
    this.isConnected = true;
  }

  /**
   * Disconnect from Kafka admin
   */
  async disconnect(): Promise<void> {
    await this.admin.disconnect();
    this.isConnected = false;
  }

  /**
   * Create topics if they don't exist
   */
  async ensureTopics(topics: TopicConfig[]): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const existingTopics = await this.admin.listTopics();
    const topicsToCreate = topics.filter(t => !existingTopics.includes(t.topic));

    if (topicsToCreate.length > 0) {
      await this.admin.createTopics({
        topics: topicsToCreate.map(t => ({
          topic: t.topic,
          numPartitions: t.numPartitions || 3,
          replicationFactor: t.replicationFactor || 1,
          configEntries: t.configEntries,
        })),
        waitForLeaders: true,
      });
      console.log(`Created ${topicsToCreate.length} Kafka topics`);
    }
  }

  /**
   * Create all event topics
   */
  async ensureAllEventTopics(prefix?: string, numPartitions: number = 3): Promise<void> {
    const topicNames = getAllTopics(prefix);
    const topics: TopicConfig[] = topicNames.map(topic => ({
      topic,
      numPartitions,
      configEntries: [
        { name: 'retention.ms', value: '604800000' }, // 7 days
        { name: 'cleanup.policy', value: 'delete' },
      ],
    }));

    // Add dead letter topic
    topics.push({
      topic: `${prefix || ''}.dead-letter`.replace(/^\./, ''),
      numPartitions: 1,
      configEntries: [
        { name: 'retention.ms', value: '2592000000' }, // 30 days
      ],
    });

    await this.ensureTopics(topics);
  }

  /**
   * List all topics
   */
  async listTopics(): Promise<string[]> {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.admin.listTopics();
  }

  /**
   * Get topic metadata
   */
  async getTopicMetadata(topics: string[]): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.admin.fetchTopicMetadata({ topics });
  }

  /**
   * Delete topics
   */
  async deleteTopics(topics: string[]): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    await this.admin.deleteTopics({ topics });
  }

  /**
   * Get consumer group offsets
   */
  async getGroupOffsets(groupId: string, topics: string[]): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.admin.fetchOffsets({ groupId, topics });
  }

  /**
   * Reset consumer group offsets
   */
  async resetGroupOffsets(groupId: string, topic: string, offset: 'earliest' | 'latest'): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const partitions = await this.admin.fetchTopicOffsets(topic);
    await this.admin.setOffsets({
      groupId,
      topic,
      partitions: partitions.map(p => ({
        partition: p.partition,
        offset: offset === 'earliest' ? p.low : p.high,
      })),
    });
  }
}

/**
 * Factory function to create Kafka admin
 */
export function createKafkaAdmin(serviceName: string = 'admin'): KafkaAdmin {
  return new KafkaAdmin(createKafkaConfigFromEnv(serviceName));
}

/**
 * Initialize all event topics (run once on deployment)
 */
export async function initializeEventTopics(prefix?: string): Promise<void> {
  const admin = createKafkaAdmin();
  try {
    await admin.connect();
    await admin.ensureAllEventTopics(prefix);
    console.log('All event topics initialized');
  } finally {
    await admin.disconnect();
  }
}
