import { BaseValidator } from './BaseValidator';

export const createProductValidator = [
  BaseValidator.requiredString('name', 1, 255),
  BaseValidator.requiredString('sku', 1, 100),
  BaseValidator.optionalString('category', 100),
  BaseValidator.uuid('category_id', 'Category ID must be a valid UUID').optional(),
  BaseValidator.requiredNumber('price', 0.01),
  BaseValidator.requiredNumber('cost', 0),
  BaseValidator.optionalInteger('stock', 0),
  BaseValidator.optionalInteger('min_stock', 0),
  BaseValidator.optionalInteger('max_stock', 0),
  BaseValidator.optionalString('description', 1000),
  BaseValidator.optionalString('short_description', 255),
  BaseValidator.optionalString('supplier', 255),
  BaseValidator.optionalString('barcode', 50),
  BaseValidator.optionalNumber('weight', 0),
  BaseValidator.object('dimensions').optional(),
  BaseValidator.optionalNumber('dimensions.length', 0),
  BaseValidator.optionalNumber('dimensions.width', 0),
  BaseValidator.optionalNumber('dimensions.height', 0),
  BaseValidator.enum('status', ['active', 'inactive', 'discontinued']),
  BaseValidator.array('variants'),
  BaseValidator.requiredString('variants.*.name', 1, 255).optional(),
  BaseValidator.requiredNumber('variants.*.price', 0.01).optional(),
  BaseValidator.requiredNumber('variants.*.cost', 0).optional(),
  BaseValidator.array('tags'),
  BaseValidator.requiredString('tags.*', 1, 50).optional()
];

export const updateProductValidator = [
  BaseValidator.uuid('id'),
  ...createProductValidator.map(validator => validator.optional())
];

export const updateStockValidator = [
  BaseValidator.uuid('id'),
  BaseValidator.requiredInteger('stock', 0),
  BaseValidator.optionalString('reason', 255)
];

export const productIdValidator = [
  BaseValidator.uuid('id')
];