import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import purchaseRoutes from './routes/purchaseRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { purchaseEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Health check with event status
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'purchase-service',
    events: {
      subscriptions: purchaseEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'purchase-service',
    subscriptions: purchaseEventService.listSubscriptions(),
    history: purchaseEventService.getEventEmitter().getEventHistory(undefined, 50),
  });
});

// Routes
app.use('/api/purchases', purchaseRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  purchaseEventService.initialize();
  console.log('[purchase-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[purchase-service] Shutting down...');
  purchaseEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Purchase service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
