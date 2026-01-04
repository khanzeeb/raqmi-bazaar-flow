# Quotation Service - NestJS with TypeORM

This is the NestJS version of the Quotation Service using TypeORM for database management and Kafka for event-driven communication.

## Features

- Full CRUD operations for quotations
- Send quotation to customer
- Accept/Decline quotations
- Convert accepted quotations to sales orders
- Automatic expired quotation processing
- Statistics and reporting
- Kafka integration for event-driven architecture

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript/JavaScript
- **PostgreSQL** - Database
- **Kafka** - Event streaming platform

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

## Database Setup

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE quotation_db;
```

## Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quotations` | Create new quotation |
| GET | `/api/quotations` | Get all quotations (with pagination/filters) |
| GET | `/api/quotations/:id` | Get quotation by ID |
| PUT | `/api/quotations/:id` | Update quotation |
| DELETE | `/api/quotations/:id` | Delete quotation |
| POST | `/api/quotations/:id/send` | Send quotation to customer |
| POST | `/api/quotations/:id/accept` | Accept quotation |
| POST | `/api/quotations/:id/decline` | Decline quotation |
| POST | `/api/quotations/:id/convert-to-sale` | Convert to sales order |
| PATCH | `/api/quotations/:id/status` | Update quotation status |
| GET | `/api/quotations/stats` | Get quotation statistics |
| GET | `/api/quotations/expired` | Get expired quotations |
| GET | `/api/quotations/report` | Generate quotation report |
| POST | `/api/quotations/process-expired` | Process expired quotations |

## Kafka Events

### Published Events
- `quotation.converted` - When quotation is converted to sale
- `quotation.sent` - When quotation is sent to customer

### Consumed Events
- `order.created.from.quotation` - When order is created from quotation

## Entity Structure

### Quotation
- id, quotationNumber, customerId, customerName, customerEmail, customerPhone
- quotationDate, validityDate, validityDays
- subtotal, taxRate, taxAmount, discountAmount, totalAmount, currency
- status (draft, sent, accepted, declined, expired, converted)
- notes, termsConditions, convertedToSaleId

### QuotationItem
- id, quotationId, productId, productName, productSku
- quantity, unitPrice, discountAmount, taxAmount, lineTotal

### QuotationHistory
- id, quotationId, action, notes, timestamp
