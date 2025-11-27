import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import dotenv from 'dotenv';

import productRoutes from './routes/productRoutes';
import productCategoryRoutes from './routes/productCategoryRoutes';
import productVariantRoutes from './routes/productVariantRoutes';
import { errorHandler } from './plugins/errorHandler';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: { colorize: true }
    } : undefined
  }
});

const PORT = parseInt(process.env.PORT || '3001');

// Register plugins
app.register(helmet);
app.register(cors, { origin: true });
app.register(compress);
app.register(errorHandler);

// Register routes
app.register(productRoutes, { prefix: '/api/products' });
app.register(productCategoryRoutes, { prefix: '/api/categories' });
app.register(productVariantRoutes, { prefix: '/api/products' });

// Health check
app.get('/health', async () => ({
  service: 'product-service',
  status: 'OK',
  timestamp: new Date().toISOString()
}));

// Start server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Product Service running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
