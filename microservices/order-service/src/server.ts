import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import saleRoutes from './routes/saleRoutes';
import returnRoutes from './routes/returnRoutes';
import paymentRoutes from './routes/paymentRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { serviceEventEmitter } from './events/EventEmitter';
import { 
  bootstrapService, 
  setupGracefulShutdown,
  ServiceBootstrapResult 
} from '../shared/events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const SERVICE_NAME = 'order-service';

let eventInfrastructure: ServiceBootstrapResult;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/sales', saleRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check with event and Kafka status
app.get('/health', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    events: {
      registered: serviceEventEmitter.listEventTypes().length,
      subscriptions: serviceEventEmitter.getSubscriptions().length,
    },
    kafka: {
      enabled: !!eventInfrastructure?.kafkaBridge,
      connected: eventInfrastructure?.isKafkaConnected() ?? false,
      stats: eventInfrastructure?.kafkaBridge?.getStats(),
    }
  });
});

// Event subscriptions and Kafka stats endpoint
app.get('/events', (req, res) => {
  res.json({
    service: SERVICE_NAME,
    subscriptions: serviceEventEmitter.getSubscriptions().map(s => ({ eventType: s.eventType })),
    history: serviceEventEmitter.getEventHistory(undefined, 50),
    kafka: {
      connected: eventInfrastructure?.isKafkaConnected() ?? false,
      stats: eventInfrastructure?.kafkaBridge?.getStats(),
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize event listeners
const initializeEventListeners = () => {
  // Register saga lifecycle listeners
  serviceEventEmitter.onEvent('sale.saga.started', (payload) => {
    console.log(`[${SERVICE_NAME}] Saga started: ${payload.data.action}`);
  });

  serviceEventEmitter.onEvent('sale.saga.completed', (payload) => {
    console.log(`[${SERVICE_NAME}] Saga completed: ${payload.data.action}`);
  });

  serviceEventEmitter.onEvent('sale.saga.failed', (payload) => {
    console.log(`[${SERVICE_NAME}] Saga failed: ${payload.data.action}, compensated: ${payload.data.compensated}`);
  });

  // Register inventory event listeners
  serviceEventEmitter.onEvent('inventory.check.response', (payload) => {
    console.log(`[${SERVICE_NAME}] Inventory check completed: available=${payload.data.available}`);
  });

  serviceEventEmitter.onEvent('inventory.reserve.response', (payload) => {
    console.log(`[${SERVICE_NAME}] Inventory reserved: ${payload.data.reservation_id}`);
  });

  serviceEventEmitter.onEvent('inventory.release.response', (payload) => {
    console.log(`[${SERVICE_NAME}] Inventory released: ${payload.data.success}`);
  });

  // Listen for cross-service events (from Kafka)
  serviceEventEmitter.onEvent('payment.completed', (payload) => {
    console.log(`[${SERVICE_NAME}] Payment completed from Kafka: ${payload.data.payment_id}`);
    // Handle payment completion for related sales
  });

  serviceEventEmitter.onEvent('customer.blocked', (payload) => {
    console.log(`[${SERVICE_NAME}] Customer blocked: ${payload.data.customer_id}`);
    // Could block new sales for this customer
  });

  console.log(`[${SERVICE_NAME}] Event listeners initialized`);
};

// Start server
const start = async () => {
  try {
    // Bootstrap event infrastructure with Kafka
    eventInfrastructure = await bootstrapService({
      serviceName: SERVICE_NAME,
      enableKafka: true,
      onKafkaConnected: () => {
        console.log(`[${SERVICE_NAME}] Kafka bridge ready for cross-service events`);
      },
      onKafkaError: (error) => {
        console.warn(`[${SERVICE_NAME}] Running without Kafka:`, error.message);
      },
    });

    // Setup graceful shutdown
    setupGracefulShutdown(async () => {
      await eventInfrastructure.shutdown();
      serviceEventEmitter.removeAllListeners();
    }, SERVICE_NAME);

    // Initialize event listeners
    initializeEventListeners();

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
