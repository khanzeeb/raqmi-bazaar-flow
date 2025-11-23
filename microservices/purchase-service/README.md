# Purchase Service

Microservice for managing purchase orders and supplier transactions.

## Features

- Purchase order creation and management
- Purchase item tracking
- Supplier relationship management
- Purchase receiving workflow
- Payment tracking
- Purchase statistics and reporting

## API Endpoints

### Purchases
- `GET /api/purchases` - List all purchases
- `POST /api/purchases` - Create new purchase
- `GET /api/purchases/:id` - Get purchase details
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase
- `PATCH /api/purchases/:id/status` - Update purchase status
- `POST /api/purchases/:id/receive` - Mark purchase as received
- `POST /api/purchases/:id/payment` - Add payment to purchase
- `GET /api/purchases/stats/summary` - Get purchase statistics

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Run migrations:
```bash
npm run migrate:latest
```

4. Start the service:
```bash
npm run dev
```

## Database Schema

### purchases
- id (uuid)
- purchase_number (string, unique)
- supplier_id (uuid)
- purchase_date (date)
- expected_delivery_date (date)
- received_date (date)
- subtotal (decimal)
- tax_amount (decimal)
- discount_amount (decimal)
- total_amount (decimal)
- paid_amount (decimal)
- currency (string)
- status (enum: pending, ordered, received, cancelled)
- payment_status (enum: pending, partial, paid)
- notes (text)
- terms_conditions (text)

### purchase_items
- id (uuid)
- purchase_id (uuid)
- product_id (uuid)
- product_name (string)
- product_sku (string)
- description (text)
- quantity (decimal)
- unit_price (decimal)
- discount_amount (decimal)
- tax_amount (decimal)
- line_total (decimal)
- received_quantity (decimal)
