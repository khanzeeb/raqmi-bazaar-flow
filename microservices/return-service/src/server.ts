import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import returnRoutes from './routes/returnRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { returnEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'return-service', 
    timestamp: new Date().toISOString(),
    events: {
      subscriptions: returnEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'return-service',
    subscriptions: returnEventService.listSubscriptions(),
    history: returnEventService.getEventEmitter().getEventHistory(undefined, 50),
  });
});

app.use('/api/returns', returnRoutes);

app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  returnEventService.initialize();
  console.log('[return-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[return-service] Shutting down...');
  returnEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Return Service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
