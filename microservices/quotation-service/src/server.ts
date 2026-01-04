import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Import routes from modules
import { quotationRoutes } from './modules/quotation';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes - Using modular feature structure
app.use('/api/quotations', quotationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'quotation-service',
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    architecture: 'modular-feature-structure'
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Quotation Service (Modular) running on port ${PORT}`);
});

export default app;
