import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import inventoryRoutes from './routes/inventoryRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { inventoryEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'inventory-service', 
    timestamp: new Date().toISOString(),
    events: {
      subscriptions: inventoryEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'inventory-service',
    subscriptions: inventoryEventService.listSubscriptions(),
    history: inventoryEventService.getEventEmitter().getEventHistory(undefined, 50),
  });
});

app.use('/api/inventory', inventoryRoutes);

app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  inventoryEventService.initialize();
  console.log('[inventory-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[inventory-service] Shutting down...');
  inventoryEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
