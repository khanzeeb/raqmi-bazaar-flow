import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import notificationRoutes from './routes/notificationRoutes';
import templateRoutes from './routes/templateRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { notificationEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3013;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-templates', templateRoutes);

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    service: 'notification-service',
    status: 'OK', 
    timestamp: new Date().toISOString(),
    events: {
      notifications: notificationEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'notification-service',
    subscriptions: {
      notifications: notificationEventService.listSubscriptions(),
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  notificationEventService.initialize();
  console.log('[notification-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[notification-service] Shutting down...');
  notificationEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
