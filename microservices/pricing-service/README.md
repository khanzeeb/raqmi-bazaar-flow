# Pricing Service

Microservice for managing pricing rules, discounts, and promotions in Raqmi Bazaar.

## Features

- Pricing rules management
- Discount configurations (percentage, fixed amount)
- Bulk pricing tiers
- Customer-specific pricing
- Time-based promotions
- Category-based pricing
- Product bundle pricing
- Dynamic pricing strategies
- Price history tracking
- Pricing analytics

## API Endpoints

### Pricing Rules
- `GET /api/pricing` - Get all pricing rules
- `GET /api/pricing/:id` - Get pricing rule by ID
- `POST /api/pricing` - Create new pricing rule
- `PUT /api/pricing/:id` - Update pricing rule
- `DELETE /api/pricing/:id` - Delete pricing rule

### Operations
- `POST /api/pricing/:id/activate` - Activate pricing rule
- `POST /api/pricing/:id/deactivate` - Deactivate pricing rule
- `GET /api/pricing/calculate` - Calculate price with rules
- `GET /api/pricing/stats` - Get pricing statistics

## Environment Variables

See `.env.example` for required environment variables.

## Running the Service

```bash
npm install
npm run migrate:latest
npm run dev
```

## Port

Default port: 3009
