import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reportRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { reportEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'report-service', 
    timestamp: new Date().toISOString(),
    events: {
      subscriptions: reportEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'report-service',
    subscriptions: reportEventService.listSubscriptions(),
    history: reportEventService.getEventEmitter().getEventHistory(undefined, 50),
  });
});

app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  reportEventService.initialize();
  console.log('[report-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[report-service] Shutting down...');
  reportEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Report Service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
