import { body, param, query } from 'express-validator';

export const createPurchaseValidator = [
  body('supplier_id').isUUID().withMessage('Valid supplier ID is required'),
  body('purchase_date').isISO8601().withMessage('Valid purchase date is required'),
  body('expected_delivery_date').optional().isISO8601().withMessage('Valid expected delivery date is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('tax_amount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a positive number'),
  body('discount_amount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a positive number'),
  body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('status').optional().isIn(['pending', 'ordered', 'received', 'cancelled']).withMessage('Invalid status'),
  body('payment_status').optional().isIn(['pending', 'partial', 'paid']).withMessage('Invalid payment status'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isUUID().withMessage('Valid product ID is required'),
  body('items.*.product_name').notEmpty().withMessage('Product name is required'),
  body('items.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be greater than 0'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
];

export const updatePurchaseValidator = [
  param('id').isUUID().withMessage('Valid purchase ID is required'),
  body('supplier_id').optional().isUUID().withMessage('Valid supplier ID is required'),
  body('purchase_date').optional().isISO8601().withMessage('Valid purchase date is required'),
  body('expected_delivery_date').optional().isISO8601().withMessage('Valid expected delivery date is required'),
  body('subtotal').optional().isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('tax_amount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a positive number'),
  body('discount_amount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a positive number'),
  body('total_amount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('status').optional().isIn(['pending', 'ordered', 'received', 'cancelled']).withMessage('Invalid status'),
  body('payment_status').optional().isIn(['pending', 'partial', 'paid']).withMessage('Invalid payment status'),
];

export const updatePurchaseStatusValidator = [
  param('id').isUUID().withMessage('Valid purchase ID is required'),
  body('status').isIn(['pending', 'ordered', 'received', 'cancelled']).withMessage('Invalid status'),
];

export const addPaymentValidator = [
  param('id').isUUID().withMessage('Valid purchase ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
];
