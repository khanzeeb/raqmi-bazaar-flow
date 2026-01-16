/**
 * Kafka Admin Tests
 */

import { KafkaAdmin, createKafkaAdmin, initializeEventTopics } from '../KafkaAdmin';
import { createKafkaConfigFromEnv, getAllTopics } from '../KafkaConfig';

const USE_REAL_KAFKA = process.env.TEST_KAFKA === 'true';

describe('KafkaAdmin', () => {
  describe('Factory Function', () => {
    it('should create admin instance with default service name', () => {
      const admin = createKafkaAdmin();
      expect(admin).toBeDefined();
    });

    it('should create admin instance with custom service name', () => {
      const admin = createKafkaAdmin('custom-service');
      expect(admin).toBeDefined();
    });
  });

  // Integration tests require real Kafka
  const integrationTests = USE_REAL_KAFKA ? describe : describe.skip;

  integrationTests('Topic Management', () => {
    let admin: KafkaAdmin;

    beforeAll(async () => {
      admin = createKafkaAdmin('test-admin');
      await admin.connect();
    }, 30000);

    afterAll(async () => {
      await admin?.disconnect();
    });

    it('should list topics', async () => {
      const topics = await admin.listTopics();
      expect(Array.isArray(topics)).toBe(true);
    });

    it('should create topics if they do not exist', async () => {
      const testTopics = [
        { topic: 'test-topic-1', numPartitions: 1 },
        { topic: 'test-topic-2', numPartitions: 1 },
      ];

      await admin.ensureTopics(testTopics);

      const topics = await admin.listTopics();
      expect(topics).toContain('test-topic-1');
      expect(topics).toContain('test-topic-2');

      // Cleanup
      await admin.deleteTopics(['test-topic-1', 'test-topic-2']);
    }, 30000);

    it('should create all event topics', async () => {
      await admin.ensureAllEventTopics('test-integration');

      const topics = await admin.listTopics();
      const expectedTopics = getAllTopics('test-integration');

      expectedTopics.forEach(expected => {
        expect(topics).toContain(expected);
      });

      // Cleanup
      await admin.deleteTopics(expectedTopics);
      await admin.deleteTopics(['test-integration.dead-letter']);
    }, 60000);

    it('should get topic metadata', async () => {
      // Create a test topic first
      await admin.ensureTopics([{ topic: 'metadata-test-topic', numPartitions: 3 }]);

      const metadata = await admin.getTopicMetadata(['metadata-test-topic']);
      
      expect(metadata).toBeDefined();
      expect(metadata.topics).toBeDefined();
      expect(metadata.topics[0].name).toBe('metadata-test-topic');
      expect(metadata.topics[0].partitions.length).toBe(3);

      // Cleanup
      await admin.deleteTopics(['metadata-test-topic']);
    }, 30000);
  });
});
