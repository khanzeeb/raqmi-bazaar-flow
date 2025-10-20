import { BaseValidator } from './BaseValidator';

export const createProductCategoryValidator = [
  BaseValidator.requiredString('name', 1, 255),
  BaseValidator.requiredString('slug', 1, 255),
  BaseValidator.optionalString('description', 1000),
  BaseValidator.optionalString('image', 500),
  BaseValidator.uuid('parent_id', 'Parent ID must be a valid UUID').optional(),
  BaseValidator.optionalInteger('sort_order', 0),
  BaseValidator.enum('status', ['active', 'inactive']),
  BaseValidator.object('meta_data').optional()
];

export const updateProductCategoryValidator = [
  BaseValidator.uuid('id'),
  ...createProductCategoryValidator.map(validator => validator.optional())
];

export const productCategoryIdValidator = [
  BaseValidator.uuid('id')
];
