import { body, param } from 'express-validator';
import { BaseValidator } from './BaseValidator';

const invoiceItemValidator = [
  body('items.*.product_name')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .withMessage('Product name must be a string'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('items.*.unit_price')
    .notEmpty()
    .withMessage('Unit price is required')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  body('items.*.tax_rate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
];

export const createInvoiceValidator = [
  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isUUID()
    .withMessage('Customer ID must be a valid UUID'),
  body('customer_name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isString()
    .withMessage('Customer name must be a string'),
  body('customer_email')
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Customer email must be valid'),
  body('issue_date')
    .notEmpty()
    .withMessage('Issue date is required')
    .isISO8601()
    .withMessage('Issue date must be a valid date'),
  body('due_date')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('tax_rate')
    .notEmpty()
    .withMessage('Tax rate is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  body('discount_type')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either percentage or fixed'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  ...invoiceItemValidator,
];

export const updateInvoiceValidator = [
  param('id')
    .isUUID()
    .withMessage('Invoice ID must be a valid UUID'),
  body('customer_name')
    .optional()
    .isString()
    .withMessage('Customer name must be a string'),
  body('customer_email')
    .optional()
    .isEmail()
    .withMessage('Customer email must be valid'),
  body('issue_date')
    .optional()
    .isISO8601()
    .withMessage('Issue date must be a valid date'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('tax_rate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  body('discount_type')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either percentage or fixed'),
  body('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one item'),
];

export const updateStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('Invoice ID must be a valid UUID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),
];

export const recordPaymentValidator = [
  param('id')
    .isUUID()
    .withMessage('Invoice ID must be a valid UUID'),
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  body('payment_method')
    .optional()
    .isString()
    .withMessage('Payment method must be a string'),
  body('payment_date')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  body('reference')
    .optional()
    .isString()
    .withMessage('Reference must be a string'),
];
