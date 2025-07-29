const { body, param } = require('express-validator');

const createProductValidator = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name is required and must be less than 255 characters')
    .matches(/^[a-zA-Z0-9\s\-_\.(),]+$/)
    .withMessage('Product name contains invalid characters'),

  body('sku')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU is required and must be less than 50 characters')
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),

  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category is required and must be less than 100 characters'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('cost')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('minStock')
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),

  body('maxStock')
    .isInt({ min: 0 })
    .withMessage('Maximum stock must be a non-negative integer'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),

  body('shortDescription')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Short description must be less than 255 characters'),

  body('supplier')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supplier name must be less than 100 characters'),

  body('barcode')
    .optional()
    .matches(/^[0-9]+$/)
    .withMessage('Barcode must contain only numbers'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),

  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),

  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),

  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued'])
    .withMessage('Status must be one of: active, inactive, discontinued'),

  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),

  body('variants.*.name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Variant name is required and must be less than 100 characters'),

  body('variants.*.value')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Variant value is required and must be less than 100 characters'),

  body('variants.*.priceModifier')
    .optional()
    .isFloat()
    .withMessage('Price modifier must be a number'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Variant stock must be a non-negative integer'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

const updateProductValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID'),

  ...createProductValidator.map(validator => validator.optional())
];

const updateStockValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('reason')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Reason must be less than 255 characters')
];

const productIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID')
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
  productIdValidator
};