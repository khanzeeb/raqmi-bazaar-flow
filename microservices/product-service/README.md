# Product Service

Product microservice built with **Fastify** and **Prisma ORM**.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL
- **Validation**: @sinclair/typebox
- **Language**: TypeScript

## Features

- **Products Management**: Full CRUD operations for products
- **Product Categories**: Hierarchical category management with tree structure
- **Product Variants**: Support for product variations (size, color, etc.)
- **Stock Management**: Track stock levels with movement history
- **Filtering & Pagination**: Advanced filtering, sorting, and pagination
- **Validation**: Request validation using TypeBox schemas

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| PATCH | `/api/products/:id/stock` | Update stock |
| GET | `/api/products/stats` | Get product statistics |
| GET | `/api/products/low-stock` | Get low stock products |
| GET | `/api/products/suppliers` | Get unique suppliers |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/tree` | Get category tree |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Variants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/:productId/variants` | Get product variants |
| GET | `/api/products/variants/:id` | Get variant by ID |
| POST | `/api/products/:productId/variants` | Create variant |
| PUT | `/api/products/variants/:id` | Update variant |
| DELETE | `/api/products/variants/:id` | Delete variant |

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/product_db?schema=public
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

## Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio
npm run prisma:studio

# Create new migration
npm run prisma:migrate
```

## Project Structure

```
src/
├── config/
│   └── prisma.ts          # Prisma client configuration
├── controllers/
│   ├── ProductController.ts
│   ├── ProductCategoryController.ts
│   └── ProductVariantController.ts
├── plugins/
│   └── errorHandler.ts    # Fastify error handler plugin
├── repositories/
│   ├── ProductRepository.ts
│   ├── ProductCategoryRepository.ts
│   └── ProductVariantRepository.ts
├── routes/
│   ├── productRoutes.ts
│   ├── productCategoryRoutes.ts
│   └── productVariantRoutes.ts
├── schemas/
│   ├── productSchemas.ts
│   ├── categorySchemas.ts
│   └── variantSchemas.ts
├── services/
│   ├── ProductService.ts
│   ├── ProductCategoryService.ts
│   └── ProductVariantService.ts
└── server.ts              # Application entry point

prisma/
└── schema.prisma          # Prisma schema
```
