import { body, param, query, ValidationChain } from 'express-validator';

const createPurchase: ValidationChain[] = [
  body('supplier_id')
    .notEmpty()
    .withMessage('Supplier ID is required')
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID'),
  
  body('purchase_date')
    .notEmpty()
    .withMessage('Purchase date is required')
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  
  body('expected_delivery_date')
    .optional()
    .isISO8601()
    .withMessage('Expected delivery date must be a valid date'),
  
  body('subtotal')
    .notEmpty()
    .withMessage('Subtotal is required')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
  
  body('tax_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a positive number'),
  
  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  
  body('total_amount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('status')
    .optional()
    .isIn(['pending', 'ordered', 'received', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.product_id')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isFloat({ min: 0.001 })
    .withMessage('Quantity must be greater than 0'),
  
  body('items.*.unit_price')
    .notEmpty()
    .withMessage('Unit price is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number')
];

const updatePurchase: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Purchase ID must be a valid UUID'),
  
  body('supplier_id')
    .optional()
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID'),
  
  body('purchase_date')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  
  body('expected_delivery_date')
    .optional()
    .isISO8601()
    .withMessage('Expected delivery date must be a valid date'),
  
  body('subtotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
  
  body('tax_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a positive number'),
  
  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  
  body('total_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('status')
    .optional()
    .isIn(['pending', 'ordered', 'received', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('items.*.product_id')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  
  body('items.*.quantity')
    .optional()
    .isFloat({ min: 0.001 })
    .withMessage('Quantity must be greater than 0'),
  
  body('items.*.unit_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number')
];

const getPurchase: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Purchase ID must be a valid UUID')
];

const deletePurchase: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Purchase ID must be a valid UUID')
];

const getPurchases: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['purchase_date', 'total_amount', 'status', 'created_at'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['pending', 'ordered', 'received', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('supplier_id')
    .optional()
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID'),
  
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const updatePurchaseStatus: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Purchase ID must be a valid UUID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'ordered', 'received', 'cancelled'])
    .withMessage('Invalid status')
];

const addPayment: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Purchase ID must be a valid UUID'),
  
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  
  body('payment_method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card'])
    .withMessage('Invalid payment method'),
  
  body('reference')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Reference must not exceed 255 characters')
];

export = {
  createPurchase,
  updatePurchase,
  getPurchase,
  deletePurchase,
  getPurchases,
  updatePurchaseStatus,
  addPayment
};