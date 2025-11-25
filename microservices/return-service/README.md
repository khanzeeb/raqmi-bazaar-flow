# Return Service

Microservice for managing product returns and refunds in Raqmi Bazaar.

## Features

- Return request management
- RMA (Return Merchandise Authorization)
- Return reason tracking
- Refund processing
- Restocking operations
- Return item condition tracking
- Return statistics
- Return policy enforcement
- Return approval workflow
- Return history tracking

## API Endpoints

### Returns
- `GET /api/returns` - Get all returns
- `GET /api/returns/:id` - Get return by ID
- `POST /api/returns` - Create new return
- `PUT /api/returns/:id` - Update return
- `DELETE /api/returns/:id` - Delete return

### Operations
- `POST /api/returns/:id/process` - Process return
- `POST /api/returns/:id/approve` - Approve return
- `POST /api/returns/:id/reject` - Reject return
- `POST /api/returns/:id/refund` - Process refund
- `GET /api/returns/stats` - Get return statistics

## Environment Variables

See `.env.example` for required environment variables.

## Running the Service

```bash
npm install
npm run migrate:latest
npm run dev
```

## Port

Default port: 3010
