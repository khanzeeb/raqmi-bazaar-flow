import { Type, Static } from '@sinclair/typebox';

// Enums
export const ProductStatusEnum = Type.Union([
  Type.Literal('active'),
  Type.Literal('inactive'),
  Type.Literal('discontinued')
]);

export const StockStatusEnum = Type.Union([
  Type.Literal('in-stock'),
  Type.Literal('low-stock'),
  Type.Literal('out-of-stock')
]);

// Dimensions schema
export const DimensionsSchema = Type.Object({
  length: Type.Number({ minimum: 0 }),
  width: Type.Number({ minimum: 0 }),
  height: Type.Number({ minimum: 0 })
});

// Product Variant schema
export const ProductVariantSchema = Type.Object({
  id: Type.Optional(Type.String({ format: 'uuid' })),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  sku: Type.Optional(Type.String({ maxLength: 100 })),
  barcode: Type.Optional(Type.String({ maxLength: 50 })),
  price: Type.Number({ minimum: 0.01 }),
  cost: Type.Number({ minimum: 0 }),
  stock: Type.Optional(Type.Integer({ minimum: 0 })),
  min_stock: Type.Optional(Type.Integer({ minimum: 0 })),
  weight: Type.Optional(Type.Number({ minimum: 0 })),
  dimensions: Type.Optional(DimensionsSchema),
  attributes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  image: Type.Optional(Type.String({ maxLength: 500 })),
  images: Type.Optional(Type.Array(Type.String())),
  status: Type.Optional(Type.Union([Type.Literal('active'), Type.Literal('inactive')])),
  sort_order: Type.Optional(Type.Integer({ minimum: 0 }))
});

// Create Product schema
export const CreateProductSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  sku: Type.String({ minLength: 1, maxLength: 100 }),
  category: Type.Optional(Type.String({ maxLength: 100 })),
  category_id: Type.Optional(Type.String({ format: 'uuid' })),
  price: Type.Number({ minimum: 0.01 }),
  cost: Type.Number({ minimum: 0 }),
  stock: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  min_stock: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  max_stock: Type.Optional(Type.Integer({ minimum: 0, default: 1000 })),
  image: Type.Optional(Type.String({ maxLength: 500 })),
  images: Type.Optional(Type.Array(Type.String())),
  description: Type.Optional(Type.String({ maxLength: 5000 })),
  short_description: Type.Optional(Type.String({ maxLength: 255 })),
  status: Type.Optional(ProductStatusEnum),
  supplier: Type.Optional(Type.String({ maxLength: 255 })),
  barcode: Type.Optional(Type.String({ maxLength: 50 })),
  weight: Type.Optional(Type.Number({ minimum: 0 })),
  dimensions: Type.Optional(DimensionsSchema),
  tags: Type.Optional(Type.Array(Type.String({ maxLength: 50 }))),
  variants: Type.Optional(Type.Array(ProductVariantSchema))
});

// Update Product schema
export const UpdateProductSchema = Type.Partial(CreateProductSchema);

// Update Stock schema
export const UpdateStockSchema = Type.Object({
  stock: Type.Integer({ minimum: 0 }),
  reason: Type.Optional(Type.String({ maxLength: 255 }))
});

// Query parameters schema
export const ProductQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
  search: Type.Optional(Type.String()),
  category: Type.Optional(Type.String()),
  category_id: Type.Optional(Type.String({ format: 'uuid' })),
  status: Type.Optional(ProductStatusEnum),
  stockStatus: Type.Optional(StockStatusEnum),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')])),
  supplier: Type.Optional(Type.String()),
  priceMin: Type.Optional(Type.Number({ minimum: 0 })),
  priceMax: Type.Optional(Type.Number({ minimum: 0 }))
});

// ID parameter schema
export const IdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

// Types
export type CreateProductInput = Static<typeof CreateProductSchema>;
export type UpdateProductInput = Static<typeof UpdateProductSchema>;
export type UpdateStockInput = Static<typeof UpdateStockSchema>;
export type ProductQueryInput = Static<typeof ProductQuerySchema>;
export type IdParam = Static<typeof IdParamSchema>;
