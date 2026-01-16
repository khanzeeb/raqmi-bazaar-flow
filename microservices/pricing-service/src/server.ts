import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pricingRoutes from './routes/pricingRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { pricingEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'pricing-service', 
    timestamp: new Date().toISOString(),
    events: {
      subscriptions: pricingEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'pricing-service',
    subscriptions: pricingEventService.listSubscriptions(),
    history: pricingEventService.getEventEmitter().getEventHistory(undefined, 50),
  });
});

app.use('/api/pricing', pricingRoutes);

app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  pricingEventService.initialize();
  console.log('[pricing-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[pricing-service] Shutting down...');
  pricingEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Pricing Service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
