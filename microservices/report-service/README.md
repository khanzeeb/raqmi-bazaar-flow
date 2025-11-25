# Report Service

Microservice for managing business reports, analytics, and data visualization in Raqmi Bazaar.

## Features

- Sales reports (daily, weekly, monthly, yearly)
- Inventory reports (stock levels, movements, low stock)
- Financial reports (revenue, expenses, profit/loss)
- Customer reports (top customers, purchase history)
- Product reports (best sellers, slow movers)
- Custom report generation
- Export reports (PDF, Excel, CSV)
- Scheduled report generation
- Report sharing and permissions

## API Endpoints

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Report Types
- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/inventory` - Inventory reports
- `GET /api/reports/financial` - Financial reports
- `GET /api/reports/customers` - Customer reports
- `GET /api/reports/products` - Product reports

### Export
- `POST /api/reports/:id/export` - Export report

## Environment Variables

See `.env.example` for required environment variables.

## Running the Service

```bash
npm install
npm run migrate:latest
npm run dev
```

## Port

Default port: 3008
