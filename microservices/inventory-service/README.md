# Inventory Service

Microservice for managing inventory, stock levels, and warehouse operations in Raqmi Bazaar.

## Features

- Stock level tracking
- Warehouse location management
- Stock movement history
- Reorder point alerts
- Low stock notifications
- Stock adjustments
- Inventory transfers
- Batch and serial number tracking
- Stock valuation
- Inventory reports

## API Endpoints

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get inventory by ID
- `POST /api/inventory` - Create inventory record
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Delete inventory

### Operations
- `POST /api/inventory/:id/adjust` - Adjust stock level
- `POST /api/inventory/:id/transfer` - Transfer stock
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/movements` - Get stock movements
- `GET /api/inventory/stats` - Get inventory statistics

## Environment Variables

See `.env.example` for required environment variables.

## Running the Service

```bash
npm install
npm run migrate:latest
npm run dev
```

## Port

Default port: 3011
