import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import purchaseRoutes from './routes/purchaseRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'purchase-service' });
});

// Routes
app.use('/api/purchases', purchaseRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Purchase service running on port ${PORT}`);
});

export default app;
