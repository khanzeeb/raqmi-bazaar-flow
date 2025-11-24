# Invoice Service

Microservice responsible for managing invoices, payment tracking, PDF generation, and invoice analytics.

## Features

- Invoice CRUD operations
- Invoice items management
- Status workflow (draft, sent, paid, overdue, cancelled)
- Payment tracking and allocation
- PDF generation
- Email sending capabilities
- Invoice statistics and reports
- Due date management
- Tax and discount calculations

## API Endpoints

### Invoice Management
- `GET /api/invoices` - Get all invoices with filtering
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice by ID
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Status Management
- `PATCH /api/invoices/:id/status` - Update invoice status
- `POST /api/invoices/:id/send` - Mark invoice as sent
- `POST /api/invoices/:id/mark-paid` - Mark invoice as paid

### Payment & Documents
- `POST /api/invoices/:id/payment` - Record payment
- `GET /api/invoices/:id/pdf` - Generate PDF
- `POST /api/invoices/:id/email` - Send invoice via email

### Analytics
- `GET /api/invoices/stats/summary` - Get invoice statistics
- `GET /api/invoices/stats/by-status` - Get invoices by status
- `GET /api/invoices/reports/generate` - Generate invoice report

## Database Schema

### invoices
- id (UUID, PK)
- invoice_number (VARCHAR, unique)
- customer_id (UUID)
- customer_name (VARCHAR)
- customer_email (VARCHAR)
- customer_phone (VARCHAR)
- customer_address (TEXT)
- issue_date (DATE)
- due_date (DATE)
- status (ENUM: draft, sent, paid, overdue, cancelled)
- subtotal (DECIMAL)
- tax_amount (DECIMAL)
- tax_rate (DECIMAL)
- discount_amount (DECIMAL)
- discount_type (ENUM: percentage, fixed)
- total_amount (DECIMAL)
- paid_amount (DECIMAL)
- balance (DECIMAL)
- notes (TEXT)
- terms (TEXT)
- payment_terms (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### invoice_items
- id (UUID, PK)
- invoice_id (UUID, FK)
- product_id (UUID)
- product_name (VARCHAR)
- description (TEXT)
- quantity (DECIMAL)
- unit_price (DECIMAL)
- discount (DECIMAL)
- tax_rate (DECIMAL)
- total (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Environment Variables

See `.env.example` for required environment variables.

## Running the Service

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate:latest

# Development
npm run dev

# Production
npm run build
npm start
```

## Port

Service runs on port 3007
