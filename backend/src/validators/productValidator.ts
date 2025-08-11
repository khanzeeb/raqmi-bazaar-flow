import { body, param } from 'express-validator';

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('SKU must be between 2 and 100 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),

  body('cost')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number')
    .toFloat(),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
    .toInt(),

  body('min_stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer')
    .toInt(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('supplier')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Supplier cannot exceed 255 characters'),

  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Barcode cannot exceed 50 characters'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number')
    .toFloat(),

  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Dimensions must be an object'),

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
    .withMessage('Status must be active, inactive, or discontinued'),

  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
];

export const updateProductValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID'),

  ...createProductValidator.map(validator => 
    validator.optional ? validator : validator.optional()
  )
];

export const updateStockValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
    .toInt(),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Reason cannot exceed 255 characters')
];

export const productIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID')
];