import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenseRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { expenseEventService } from './events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with event status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'expense-service',
    events: {
      subscriptions: expenseEventService.listSubscriptions().length,
    }
  });
});

// Event subscriptions endpoint
app.get('/events', (req, res) => {
  res.json({
    service: 'expense-service',
    subscriptions: expenseEventService.listSubscriptions(),
    history: expenseEventService.getEventEmitter().getEventHistory(undefined, 50),
  });
});

// Routes
app.use('/api/expenses', expenseRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize event services
const initializeEventServices = () => {
  expenseEventService.initialize();
  console.log('[expense-service] Event services initialized');
};

// Graceful shutdown
const shutdown = () => {
  console.log('[expense-service] Shutting down...');
  expenseEventService.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`Expense service running on port ${PORT}`);
  initializeEventServices();
});

export default app;
