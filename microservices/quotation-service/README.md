# Quotation Service

Dedicated microservice for managing quotations and quotes in the system.

## Features

- **Quotation Management**: Complete CRUD operations for quotations
- **Quotation Items**: Manage line items with product details
- **Status Management**: Draft, Sent, Accepted, Declined, Expired, Converted
- **Business Operations**:
  - Send quotations to customers
  - Accept/Decline quotations
  - Convert accepted quotations to sales
  - Automatic expiration processing
- **Statistics & Reporting**: Comprehensive quotation analytics
- **Repository Pattern**: Clean separation of data access logic
- **Mapper Pattern**: Convert between database and domain models

## Architecture

The service follows SOLID principles with:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic layer
- **Repositories**: Data access layer
- **Mappers**: Data transformation layer
- **Models**: Pure data interfaces
- **Validators**: Input validation layer

## API Endpoints

### Quotations
- `POST /api/quotations` - Create quotation
- `GET /api/quotations` - Get all quotations (with filters)
- `GET /api/quotations/:id` - Get quotation by ID
- `PUT /api/quotations/:id` - Update quotation
- `DELETE /api/quotations/:id` - Delete quotation

### Statistics & Reports
- `GET /api/quotations/stats` - Get quotation statistics
- `GET /api/quotations/expired` - Get expired quotations
- `GET /api/quotations/report` - Get quotation report

### Status Management
- `POST /api/quotations/:id/send` - Send quotation
- `POST /api/quotations/:id/accept` - Accept quotation
- `POST /api/quotations/:id/decline` - Decline quotation
- `POST /api/quotations/:id/convert-to-sale` - Convert to sale
- `PATCH /api/quotations/:id/status` - Update status

### Batch Operations
- `POST /api/quotations/process-expired` - Process expired quotations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Run migrations:
```bash
npm run migrate
```

4. Start service:
```bash
npm run dev
```

## Database Schema

### quotations
- id, quotation_number, customer_id
- quotation_date, validity_date
- subtotal, tax_amount, discount_amount, total_amount, currency
- status, notes, terms_conditions
- created_at, updated_at

### quotation_items
- id, quotation_id, product_id
- product_name, product_sku, description
- quantity, unit_price, discount_amount, tax_amount, line_total
- created_at, updated_at

## Ports

- Development: 3004
- Production: Configured via PORT environment variable
