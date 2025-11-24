# Expense Service

Microservice for managing expenses, categories, payments, and approvals.

## Features

- Expense CRUD operations
- Category management (rent, utilities, transportation, office, marketing, maintenance, other)
- Status workflow (pending → approved → paid, or cancelled)
- Payment method tracking
- Receipt attachment
- Vendor tracking
- Filtering and search
- Statistics and reporting
- Approval workflow

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/stats/summary` - Get expense statistics
- `GET /api/expenses/stats/by-category` - Get expenses grouped by category
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `PATCH /api/expenses/:id/status` - Update expense status
- `POST /api/expenses/:id/approve` - Approve expense
- `POST /api/expenses/:id/receipt` - Attach receipt

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
