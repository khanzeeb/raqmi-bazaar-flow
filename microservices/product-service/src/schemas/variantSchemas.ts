import { Type, Static } from '@sinclair/typebox';

export const VariantStatusEnum = Type.Union([
  Type.Literal('active'),
  Type.Literal('inactive')
]);

export const DimensionsSchema = Type.Object({
  length: Type.Number({ minimum: 0 }),
  width: Type.Number({ minimum: 0 }),
  height: Type.Number({ minimum: 0 })
});

export const CreateVariantSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  sku: Type.Optional(Type.String({ maxLength: 100 })),
  barcode: Type.Optional(Type.String({ maxLength: 50 })),
  price: Type.Number({ minimum: 0.01 }),
  cost: Type.Number({ minimum: 0 }),
  stock: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  min_stock: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  weight: Type.Optional(Type.Number({ minimum: 0 })),
  dimensions: Type.Optional(DimensionsSchema),
  attributes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  image: Type.Optional(Type.String({ maxLength: 500 })),
  images: Type.Optional(Type.Array(Type.String())),
  status: Type.Optional(VariantStatusEnum),
  sort_order: Type.Optional(Type.Integer({ minimum: 0, default: 0 }))
});

export const UpdateVariantSchema = Type.Partial(CreateVariantSchema);

export const ProductIdParamSchema = Type.Object({
  productId: Type.String({ format: 'uuid' })
});

export const IdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type CreateVariantInput = Static<typeof CreateVariantSchema>;
export type UpdateVariantInput = Static<typeof UpdateVariantSchema>;
