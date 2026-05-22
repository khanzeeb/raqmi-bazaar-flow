# Return Service

NestJS + Knex microservice for product returns, refunds, and workflow management.

## Setup

```bash
cp .env.example .env
npm install
```

## Database (PostgreSQL)

Configure connection in `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=return_db
```

### Migrations

```bash
npm run migrate:latest      # apply all migrations
npm run migrate:rollback    # roll back last batch
npm run migrate:make <name> # create a new migration
```

Migrations live in `src/migrations/`:
- `001_create_return_tables.ts` — returns + return_items tables
- `002_seed_indexes.ts` — composite postgres indexes

## Run

```bash
npm run dev      # development
npm run build && npm start
```

## Testing

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:cov      # coverage report
```

### Test files

| File | Coverage |
|------|----------|
| `src/modules/return/__tests__/return.mapper.spec.ts` | DTO ↔ row mapping, totals |
| `src/modules/return/__tests__/return.service.spec.ts` | Business logic, workflow guards, validation |
| `src/modules/return/__tests__/return.controller.spec.ts` | All REST endpoints with supertest, validation pipe errors |

### Endpoints under test

| Method | Path | Cases |
|--------|------|-------|
| GET | `/returns` | list, filters, invalid enum |
| GET | `/returns/stats` | date range |
| GET | `/returns/sale/:saleId` | by sale |
| GET | `/returns/customer/:customerId` | by customer |
| GET | `/returns/:id` | found / not found |
| POST | `/returns` | valid, missing items, bad uuid, bad enum, empty items, negative qty |
| PUT | `/returns/:id` | valid update, invalid status |
| DELETE | `/returns/:id` | success |
| POST | `/returns/:id/approve` | with / without processedBy |
| POST | `/returns/:id/reject` | with reason, bad uuid |
| POST | `/returns/:id/process` | with refund, no body, negative refund |
