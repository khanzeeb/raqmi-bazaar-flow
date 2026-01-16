import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import customerRoutes from './routes/customerRoutes';
import supplierRoutes from './routes/supplierRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { customerEventService, supplierEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    service: 'customer-service',
    status: 'OK', 
    timestamp: new Date().toISOString(),
    events: {
      customer: customerEventService.listSubscriptions().length,
      supplier: supplierEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'customer-service',
    subscriptions: {
      customer: customerEventService.listSubscriptions(),
      supplier: supplierEventService.listSubscriptions(),
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  customerEventService.initialize();
  supplierEventService.initialize();
  console.log('[customer-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[customer-service] Shutting down...');
  customerEventService.destroy();
  supplierEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Customer Service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
