import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import returnRoutes from './routes/returnRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'return-service', timestamp: new Date().toISOString() });
});

app.use('/api/returns', returnRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Return Service running on port ${PORT}`);
});

export default app;
