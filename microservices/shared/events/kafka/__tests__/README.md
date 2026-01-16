# Kafka Event Bridge Tests

## Running Tests

### Unit Tests (No Kafka Required)
```bash
npm test -- --testPathPattern="kafka/__tests__"
```

### Integration Tests (Requires Kafka)
```bash
# Start Kafka first (using Docker)
docker-compose up -d kafka zookeeper

# Run tests with Kafka enabled
TEST_KAFKA=true npm test -- --testPathPattern="kafka/__tests__"
```

## Test Coverage

### KafkaConfig.test.ts
- Environment variable configuration
- Event-to-topic mapping
- Topic prefix handling
- All event type mappings

### KafkaEventBridge.integration.test.ts
- Bridge configuration
- Event emitter integration
- Connection handling
- Message publishing (unit level)
- Cross-service communication (integration)
- Saga event flow (integration)

### CrossServiceDelivery.integration.test.ts
- Service bridge factory tests
- Order-to-payment flow
- Inventory-order saga flow
- Full order lifecycle simulation

### KafkaAdmin.test.ts
- Topic creation
- Topic listing
- Topic metadata
- All event topics initialization

### DeadLetterQueue.test.ts
- DLQ configuration
- Error tracking
- Message batching
- Graceful degradation

## Test Utilities

### EventCollector
Collects events for assertion:
```typescript
const collector = new EventCollector();
emitter.onEvent('sale.created', (p) => collector.collect('sale.created', p));
await collector.waitForEvent('sale.created', 5000);
```

### TestPayloadFactory
Creates test payloads:
```typescript
const sale = TestPayloadFactory.createSaleCreatedPayload();
const payment = TestPayloadFactory.createPaymentPayload();
```

### MockKafkaProducer / MockKafkaConsumer
Mock Kafka clients for unit tests without real Kafka.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| TEST_KAFKA | Enable integration tests | false |
| KAFKA_BROKER | Kafka broker address | localhost:9092 |
| KAFKA_BROKERS | Comma-separated brokers | localhost:9092 |

## CI/CD Integration

For CI pipelines, use the Kafka integration test docker-compose:

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  tests:
    build: .
    depends_on:
      - kafka
    environment:
      TEST_KAFKA: "true"
      KAFKA_BROKER: kafka:9092
    command: npm test -- --testPathPattern="kafka/__tests__"
```
