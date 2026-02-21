import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quotationRoutes from './routes/quotation.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'quotation-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/quotations', quotationRoutes);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message);
  const status = err.message?.includes('not found') ? 404
    : err.message?.includes('Cannot') ? 400
    : 500;
  res.status(status).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Quotation Service running on port ${PORT}`);
});

export default app;
