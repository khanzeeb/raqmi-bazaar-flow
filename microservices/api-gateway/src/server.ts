import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Service URLs
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003';
const QUOTATION_SERVICE_URL = process.env.QUOTATION_SERVICE_URL || 'http://localhost:3004';
const PURCHASE_SERVICE_URL = process.env.PURCHASE_SERVICE_URL || 'http://localhost:3005';
const EXPENSE_SERVICE_URL = process.env.EXPENSE_SERVICE_URL || 'http://localhost:3006';

// Proxy configurations
const createProxy = (target: string, pathRewrite?: Record<string, string>) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Service unavailable' });
    }
  });
};

// Route proxying
app.use('/api/products', createProxy(PRODUCT_SERVICE_URL, { '^/api/products': '/api/products' }));
app.use('/api/inventory', createProxy(PRODUCT_SERVICE_URL, { '^/api/inventory': '/api/inventory' }));

app.use('/api/sales', createProxy(ORDER_SERVICE_URL, { '^/api/sales': '/api/sales' }));
app.use('/api/returns', createProxy(ORDER_SERVICE_URL, { '^/api/returns': '/api/returns' }));
app.use('/api/payments', createProxy(ORDER_SERVICE_URL, { '^/api/payments': '/api/payments' }));
app.use('/api/invoices', createProxy(ORDER_SERVICE_URL, { '^/api/invoices': '/api/invoices' }));

app.use('/api/quotations', createProxy(QUOTATION_SERVICE_URL, { '^/api/quotations': '/api/quotations' }));

app.use('/api/purchases', createProxy(PURCHASE_SERVICE_URL, { '^/api/purchases': '/api/purchases' }));

app.use('/api/expenses', createProxy(EXPENSE_SERVICE_URL, { '^/api/expenses': '/api/expenses' }));

app.use('/api/customers', createProxy(CUSTOMER_SERVICE_URL, { '^/api/customers': '/api/customers' }));
app.use('/api/suppliers', createProxy(CUSTOMER_SERVICE_URL, { '^/api/suppliers': '/api/suppliers' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Service URLs:');
  console.log(`- Product Service: ${PRODUCT_SERVICE_URL}`);
  console.log(`- Order Service: ${ORDER_SERVICE_URL}`);
  console.log(`- Customer Service: ${CUSTOMER_SERVICE_URL}`);
  console.log(`- Quotation Service: ${QUOTATION_SERVICE_URL}`);
  console.log(`- Purchase Service: ${PURCHASE_SERVICE_URL}`);
  console.log(`- Expense Service: ${EXPENSE_SERVICE_URL}`);
});