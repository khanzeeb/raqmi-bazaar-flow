# Microservices Architecture

This project has been converted from a monolithic architecture to a microservices architecture following the provided diagram.

## Architecture Overview

```
Load Balancer (Nginx)
         ↓
    API Gateway
         ↓
    ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
    ↓                ↓                  ↓                  ↓                ↓              ↓                ↓
Product Service  Order Service  Customer Service  Quotation Service  Purchase Service  Expense Service  Invoice Service
    ↓                ↓                  ↓                  ↓                ↓              ↓                ↓
 Product DB      Order DB        Customer DB        Quotation DB      Purchase DB    Expense DB      Invoice DB
```

## Services

### 1. API Gateway (Port 3000)
- Routes requests to appropriate microservices
- Handles rate limiting and CORS
- Service discovery and load balancing

### 2. Product Service (Port 3001)
- Manages products, categories, variants
- Handles inventory operations
- Database: `product_db`

### 3. Order Service (Port 3002)
- Manages sales, returns
- Handles payments and invoices
- Database: `order_db`

### 4. Customer Service (Port 3003)
- Manages customers and suppliers
- Handles customer credit operations
- Database: `customer_db`

### 5. Quotation Service (Port 3004)
- Manages quotations and quotes
- Handles quotation lifecycle (draft, sent, accepted, declined, expired, converted)
- Quotation statistics and reporting
- Database: `quotation_db`

### 6. Purchase Service (Port 3005)
- Manages purchase orders
- Handles supplier transactions
- Purchase receiving workflow
- Payment tracking
- Database: `purchase_db`

### 7. Expense Service (Port 3006)
- Manages expenses and payments
- Expense categories and tracking
- Approval workflow (pending → approved → paid)
- Receipt attachment
- Statistics and reporting by category
- Database: `expense_db`

### 8. Invoice Service (Port 3007)
- Manages invoices and billing
- Invoice status workflow (draft, sent, paid, overdue, cancelled)
- Payment tracking and allocation
- PDF generation capabilities
- Email sending functionality
- Invoice statistics and reporting
- Due date management and overdue detection
- Database: `invoice_db`

## Running the Services

### Development Mode
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individual services
cd api-gateway && npm run dev
cd product-service && npm run dev
cd order-service && npm run dev
cd customer-service && npm run dev
cd quotation-service && npm run dev
cd purchase-service && npm run dev
cd expense-service && npm run dev
cd invoice-service && npm run dev
```

### Production Mode
```bash
# Build and start all services
docker-compose up --build
```

## Environment Variables

Each service requires its own environment variables:

### API Gateway
- `PRODUCT_SERVICE_URL`
- `ORDER_SERVICE_URL`
- `CUSTOMER_SERVICE_URL`
- `QUOTATION_SERVICE_URL`
- `PURCHASE_SERVICE_URL`
- `EXPENSE_SERVICE_URL`
- `INVOICE_SERVICE_URL`

### Product Service
- `PRODUCT_DB_HOST`
- `PRODUCT_DB_PORT`
- `PRODUCT_DB_USER`
- `PRODUCT_DB_PASSWORD`
- `PRODUCT_DB_NAME`

### Order Service
- `ORDER_DB_HOST`
- `ORDER_DB_PORT`
- `ORDER_DB_USER`
- `ORDER_DB_PASSWORD`
- `ORDER_DB_NAME`
- `PRODUCT_SERVICE_URL`
- `CUSTOMER_SERVICE_URL`

### Customer Service
- `CUSTOMER_DB_HOST`
- `CUSTOMER_DB_PORT`
- `CUSTOMER_DB_USER`
- `CUSTOMER_DB_PASSWORD`
- `CUSTOMER_DB_NAME`

### Quotation Service
- `QUOTATION_DB_HOST`
- `QUOTATION_DB_PORT`
- `QUOTATION_DB_USER`
- `QUOTATION_DB_PASSWORD`
- `QUOTATION_DB_NAME`

### Purchase Service
- `PURCHASE_DB_HOST`
- `PURCHASE_DB_PORT`
- `PURCHASE_DB_USER`
- `PURCHASE_DB_PASSWORD`
- `PURCHASE_DB_NAME`

### Expense Service
- `EXPENSE_DB_HOST`
- `EXPENSE_DB_PORT`
- `EXPENSE_DB_USER`
- `EXPENSE_DB_PASSWORD`
- `EXPENSE_DB_NAME`

### Invoice Service
- `INVOICE_DB_HOST`
- `INVOICE_DB_PORT`
- `INVOICE_DB_USER`
- `INVOICE_DB_PASSWORD`
- `INVOICE_DB_NAME`

## Database Migration

Each service has its own database and migration scripts:

```bash
# Product Service
cd product-service && npm run migrate

# Order Service  
cd order-service && npm run migrate

# Customer Service
cd customer-service && npm run migrate

# Quotation Service
cd quotation-service && npm run migrate

# Purchase Service
cd purchase-service && npm run migrate

# Expense Service
cd expense-service && npm run migrate:latest

# Invoice Service
cd invoice-service && npm run migrate:latest
```

## API Endpoints

All requests go through the API Gateway at `http://localhost` (or port 80).

### Product Service
- `GET /api/products`
- `POST /api/products`
- `GET /api/inventory`

### Order Service
- `GET /api/sales`
- `POST /api/sales`
- `GET /api/returns`
- `GET /api/payments`

### Quotation Service
- `GET /api/quotations`
- `POST /api/quotations`
- `GET /api/quotations/:id`
- `PUT /api/quotations/:id`
- `DELETE /api/quotations/:id`
- `GET /api/quotations/stats`
- `POST /api/quotations/:id/send`
- `POST /api/quotations/:id/accept`
- `POST /api/quotations/:id/decline`
- `POST /api/quotations/:id/convert-to-sale`

### Purchase Service
- `GET /api/purchases`
- `POST /api/purchases`
- `GET /api/purchases/:id`
- `PUT /api/purchases/:id`
- `DELETE /api/purchases/:id`
- `PATCH /api/purchases/:id/status`
- `POST /api/purchases/:id/receive`
- `POST /api/purchases/:id/payment`
- `GET /api/purchases/stats/summary`

### Expense Service
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/:id`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `PATCH /api/expenses/:id/status`
- `POST /api/expenses/:id/approve`
- `POST /api/expenses/:id/receipt`
- `GET /api/expenses/stats/summary`
- `GET /api/expenses/stats/by-category`

### Invoice Service
- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/:id`
- `PUT /api/invoices/:id`
- `DELETE /api/invoices/:id`
- `PATCH /api/invoices/:id/status`
- `POST /api/invoices/:id/send`
- `POST /api/invoices/:id/mark-paid`
- `POST /api/invoices/:id/payment`
- `GET /api/invoices/:id/pdf`
- `POST /api/invoices/:id/email`
- `GET /api/invoices/stats/summary`
- `GET /api/invoices/stats/by-status`
- `POST /api/invoices/check-overdue`

### Customer Service
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/suppliers`

## Inter-Service Communication

Services communicate with each other through HTTP APIs when needed (e.g., Order Service calling Product Service to check inventory).

## Monitoring and Health Checks

Each service exposes a `/health` endpoint for monitoring:
- API Gateway: `http://localhost:3000/health`
- Product Service: `http://localhost:3001/health`
- Order Service: `http://localhost:3002/health`
- Customer Service: `http://localhost:3003/health`
- Quotation Service: `http://localhost:3004/health`
- Purchase Service: `http://localhost:3005/health`
- Expense Service: `http://localhost:3006/health`