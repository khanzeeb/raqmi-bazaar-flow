import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import variantRoutes from './routes/variantRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { productEventService } from './events';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Middleware
app.use(helmet());
app.use(cors({ origin: true }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', variantRoutes);

// Health check with event status
app.get('/health', (req, res) => {
  res.json({
    service: 'product-service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    events: {
      subscriptions: productEventService.listSubscriptions().length
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'product-service',
    subscriptions: productEventService.listSubscriptions(),
    history: productEventService.getEventEmitter().getEventHistory(undefined, 50)
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  productEventService.initialize();
  console.log('[product-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[product-service] Shutting down...');
  productEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Product Service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
