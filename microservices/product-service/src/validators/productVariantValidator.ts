import { BaseValidator } from './BaseValidator';

export const createProductVariantValidator = [
  BaseValidator.requiredString('name', 1, 255),
  BaseValidator.optionalString('sku', 100),
  BaseValidator.optionalString('barcode', 50),
  BaseValidator.requiredNumber('price', 0.01),
  BaseValidator.requiredNumber('cost', 0),
  BaseValidator.optionalInteger('stock', 0),
  BaseValidator.optionalInteger('min_stock', 0),
  BaseValidator.optionalNumber('weight', 0),
  BaseValidator.object('dimensions').optional(),
  BaseValidator.optionalNumber('dimensions.length', 0),
  BaseValidator.optionalNumber('dimensions.width', 0),
  BaseValidator.optionalNumber('dimensions.height', 0),
  BaseValidator.object('attributes').optional(),
  BaseValidator.optionalString('image', 500),
  BaseValidator.array('images'),
  BaseValidator.requiredString('images.*', 1, 500).optional(),
  BaseValidator.enum('status', ['active', 'inactive']),
  BaseValidator.optionalInteger('sort_order', 0)
];

export const updateProductVariantValidator = [
  BaseValidator.uuid('id'),
  ...createProductVariantValidator.map(validator => validator.optional())
];

export const productVariantIdValidator = [
  BaseValidator.uuid('id')
];
