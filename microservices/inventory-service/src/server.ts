import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import inventoryRoutes from './routes/inventoryRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { inventoryEventService } from './events';
import { 
  bootstrapService, 
  setupGracefulShutdown,
  ServiceBootstrapResult 
} from '../shared/events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;
const SERVICE_NAME = 'inventory-service';

let eventInfrastructure: ServiceBootstrapResult;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with Kafka status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: SERVICE_NAME, 
    timestamp: new Date().toISOString(),
    events: {
      subscriptions: inventoryEventService.listSubscriptions().length,
    },
    kafka: {
      enabled: !!eventInfrastructure?.kafkaBridge,
      connected: eventInfrastructure?.isKafkaConnected() ?? false,
      stats: eventInfrastructure?.kafkaBridge?.getStats(),
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: SERVICE_NAME,
    subscriptions: inventoryEventService.listSubscriptions(),
    history: inventoryEventService.getEventEmitter().getEventHistory(undefined, 50),
    kafka: {
      connected: eventInfrastructure?.isKafkaConnected() ?? false,
      stats: eventInfrastructure?.kafkaBridge?.getStats(),
    }
  });
});

app.use('/api/inventory', inventoryRoutes);

app.use(notFound);
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    // Bootstrap event infrastructure with Kafka
    eventInfrastructure = await bootstrapService({
      serviceName: SERVICE_NAME,
      enableKafka: true,
      onKafkaConnected: () => {
        console.log(`[${SERVICE_NAME}] Kafka bridge ready - listening for inventory requests`);
      },
      onKafkaError: (error) => {
        console.warn(`[${SERVICE_NAME}] Running without Kafka:`, error.message);
      },
    });

    // Initialize local event service
    inventoryEventService.initialize();

    // Setup graceful shutdown
    setupGracefulShutdown(async () => {
      await eventInfrastructure.shutdown();
      inventoryEventService.destroy();
    }, SERVICE_NAME);

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`${SERVICE_NAME} running on port ${PORT}`);
      console.log(`Kafka: ${eventInfrastructure.isKafkaConnected() ? 'connected' : 'disconnected'}`);
    });
  } catch (error) {
    console.error(`[${SERVICE_NAME}] Failed to start:`, error);
    process.exit(1);
  }
};

start();

export default app;
