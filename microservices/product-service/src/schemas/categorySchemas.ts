import { Type, Static } from '@sinclair/typebox';

export const CategoryStatusEnum = Type.Union([
  Type.Literal('active'),
  Type.Literal('inactive')
]);

export const CreateCategorySchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  slug: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String({ maxLength: 1000 })),
  image: Type.Optional(Type.String({ maxLength: 500 })),
  parent_id: Type.Optional(Type.String({ format: 'uuid' })),
  sort_order: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  status: Type.Optional(CategoryStatusEnum),
  meta_data: Type.Optional(Type.Record(Type.String(), Type.Any()))
});

export const UpdateCategorySchema = Type.Partial(CreateCategorySchema);

export const CategoryQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 50 })),
  search: Type.Optional(Type.String()),
  parent_id: Type.Optional(Type.String()),
  status: Type.Optional(CategoryStatusEnum)
});

export const IdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' })
});

export type CreateCategoryInput = Static<typeof CreateCategorySchema>;
export type UpdateCategoryInput = Static<typeof UpdateCategorySchema>;
export type CategoryQueryInput = Static<typeof CategoryQuerySchema>;
