# Quotation Service — Express + Knex

Lightweight quotation management service using Express and Knex query builder.

## Features

- Full CRUD operations for quotations
- Send / Accept / Decline quotations
- Convert accepted quotations to sales orders
- Automatic expired quotation processing
- Statistics and reporting

## Tech Stack

- **Express** — HTTP framework
- **Knex** — SQL query builder
- **PostgreSQL** — Database

## Setup

```bash
npm install
cp .env.example .env
# Create the database
createdb quotation_db
# Run migrations
npx knex migrate:latest --knexfile knexfile.ts
# Start
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quotations` | Create new quotation |
| GET | `/api/quotations` | List quotations (paginated) |
| GET | `/api/quotations/:id` | Get quotation by ID |
| PUT | `/api/quotations/:id` | Update quotation |
| DELETE | `/api/quotations/:id` | Delete quotation |
| POST | `/api/quotations/:id/send` | Send quotation |
| POST | `/api/quotations/:id/accept` | Accept quotation |
| POST | `/api/quotations/:id/decline` | Decline quotation |
| POST | `/api/quotations/:id/convert-to-sale` | Convert to sale |
| PATCH | `/api/quotations/:id/status` | Update status |
| GET | `/api/quotations/stats` | Statistics |
| GET | `/api/quotations/expired` | Expired quotations |
| GET | `/api/quotations/report` | Report |
| POST | `/api/quotations/process-expired` | Process expired |
