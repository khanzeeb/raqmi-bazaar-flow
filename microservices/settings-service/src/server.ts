import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import settingsRoutes from './routes/settingsRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { settingsEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3012;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'settings-service', 
    timestamp: new Date().toISOString(),
    events: {
      subscriptions: settingsEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'settings-service',
    subscriptions: settingsEventService.listSubscriptions(),
    history: settingsEventService.getEventEmitter().getEventHistory(undefined, 50),
  });
});

app.use('/api/settings', settingsRoutes);

app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  settingsEventService.initialize();
  console.log('[settings-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[settings-service] Shutting down...');
  settingsEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Settings Service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
