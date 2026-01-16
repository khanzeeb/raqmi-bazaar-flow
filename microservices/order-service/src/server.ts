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
import { SaleEventEmitter } from './events/sale.events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

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

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    service: 'order-service',
    status: 'OK', 
    timestamp: new Date().toISOString(),
    events: {
      registered: serviceEventEmitter.listEventTypes().length,
      subscriptions: serviceEventEmitter.getSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'order-service',
    subscriptions: serviceEventEmitter.getSubscriptions().map(s => ({ eventType: s.eventType })),
    history: serviceEventEmitter.getEventHistory(undefined, 50),
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize event listeners
const initializeEventListeners = () => {
  // Register saga lifecycle listeners
  serviceEventEmitter.onEvent('sale.saga.started', (payload) => {
    console.log(`[order-service] Saga started: ${payload.data.action}`);
  });

  serviceEventEmitter.onEvent('sale.saga.completed', (payload) => {
    console.log(`[order-service] Saga completed: ${payload.data.action}`);
  });

  serviceEventEmitter.onEvent('sale.saga.failed', (payload) => {
    console.log(`[order-service] Saga failed: ${payload.data.action}, compensated: ${payload.data.compensated}`);
  });

  // Register inventory event listeners
  serviceEventEmitter.onEvent('inventory.check.response', (payload) => {
    console.log(`[order-service] Inventory check completed: available=${payload.data.available}`);
  });

  serviceEventEmitter.onEvent('inventory.reserve.response', (payload) => {
    console.log(`[order-service] Inventory reserved: ${payload.data.reservation_id}`);
  });

  serviceEventEmitter.onEvent('inventory.release.response', (payload) => {
    console.log(`[order-service] Inventory released: ${payload.data.success}`);
  });

  console.log('[order-service] Event listeners initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[order-service] Shutting down...');
  serviceEventEmitter.removeAllListeners();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
  initializeEventListeners();
});

export default app;
