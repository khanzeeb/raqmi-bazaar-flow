const { body, param, query } = require('express-validator');

const paymentValidators = {
  createPayment: [
    body('customer_id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),
    
    body('payment_method_code')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Payment method code is required and must be valid'),
    
    body('payment_date')
      .isISO8601()
      .withMessage('Payment date must be a valid date'),
    
    body('status')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'cancelled'])
      .withMessage('Status must be one of: pending, completed, failed, cancelled'),
    
    body('reference')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Reference must be a string with maximum 255 characters'),
    
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Notes must be a string with maximum 1000 characters'),
    
    body('allocations')
      .optional()
      .isArray()
      .withMessage('Allocations must be an array'),
    
    body('allocations.*.order_id')
      .if(body('allocations').exists())
      .isInt({ min: 1 })
      .withMessage('Order ID must be a positive integer'),
    
    body('allocations.*.order_type')
      .if(body('allocations').exists())
      .optional()
      .isIn(['invoice', 'sales_order', 'quotation'])
      .withMessage('Order type must be one of: invoice, sales_order, quotation'),
    
    body('allocations.*.allocated_amount')
      .if(body('allocations').exists())
      .isFloat({ min: 0.01 })
      .withMessage('Allocated amount must be a positive number'),
    
    body('allocations.*.order_total')
      .if(body('allocations').exists())
      .isFloat({ min: 0.01 })
      .withMessage('Order total must be a positive number')
  ],

  updatePayment: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Payment ID must be a positive integer'),
    
    body('customer_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),
    
    body('payment_method_code')
      .optional()
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Payment method code must be valid'),
    
    body('payment_date')
      .optional()
      .isISO8601()
      .withMessage('Payment date must be a valid date'),
    
    body('status')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'cancelled'])
      .withMessage('Status must be one of: pending, completed, failed, cancelled'),
    
    body('reference')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Reference must be a string with maximum 255 characters'),
    
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Notes must be a string with maximum 1000 characters')
  ],

  getPayment: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Payment ID must be a positive integer')
  ],

  deletePayment: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Payment ID must be a positive integer')
  ],

  getPayments: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('customer_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    query('status')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'cancelled'])
      .withMessage('Status must be one of: pending, completed, failed, cancelled'),
    
    query('payment_method_code')
      .optional()
      .isString()
      .withMessage('Payment method code must be a string'),
    
    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('From date must be a valid date'),
    
    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('To date must be a valid date'),
    
    query('search')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Search term must be a string with maximum 255 characters')
  ],

  createPaymentMethod: [
    body('name')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name is required and must be between 1 and 100 characters'),
    
    body('code')
      .isString()
      .isLength({ min: 1, max: 50 })
      .matches(/^[a-z_]+$/)
      .withMessage('Code is required, must be lowercase letters and underscores only'),
    
    body('description')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Description must be a string with maximum 500 characters'),
    
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('Is active must be a boolean'),
    
    body('requires_reference')
      .optional()
      .isBoolean()
      .withMessage('Requires reference must be a boolean'),
    
    body('requires_approval')
      .optional()
      .isBoolean()
      .withMessage('Requires approval must be a boolean'),
    
    body('validation_rules')
      .optional()
      .isObject()
      .withMessage('Validation rules must be an object')
  ],

  updatePaymentMethod: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Payment method ID must be a positive integer'),
    
    body('name')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    
    body('code')
      .optional()
      .isString()
      .isLength({ min: 1, max: 50 })
      .matches(/^[a-z_]+$/)
      .withMessage('Code must be lowercase letters and underscores only'),
    
    body('description')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Description must be a string with maximum 500 characters'),
    
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('Is active must be a boolean'),
    
    body('requires_reference')
      .optional()
      .isBoolean()
      .withMessage('Requires reference must be a boolean'),
    
    body('requires_approval')
      .optional()
      .isBoolean()
      .withMessage('Requires approval must be a boolean')
  ],

  createAllocation: [
    body('payment_id')
      .isInt({ min: 1 })
      .withMessage('Payment ID must be a positive integer'),
    
    body('order_id')
      .isInt({ min: 1 })
      .withMessage('Order ID must be a positive integer'),
    
    body('order_number')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Order number is required'),
    
    body('order_type')
      .optional()
      .isIn(['invoice', 'sales_order', 'quotation'])
      .withMessage('Order type must be one of: invoice, sales_order, quotation'),
    
    body('allocated_amount')
      .isFloat({ min: 0.01 })
      .withMessage('Allocated amount must be a positive number'),
    
    body('order_total')
      .isFloat({ min: 0.01 })
      .withMessage('Order total must be a positive number'),
    
    body('previously_paid')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Previously paid must be a non-negative number'),
    
    body('remaining_after_payment')
      .isFloat({ min: 0 })
      .withMessage('Remaining after payment must be a non-negative number')
  ],

  updateCredit: [
    param('customerId')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    body('credit_limit')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Credit limit must be a non-negative number'),
    
    body('adjustment_amount')
      .optional()
      .isFloat()
      .withMessage('Adjustment amount must be a number'),
    
    body('adjustment_type')
      .if(body('adjustment_amount').exists())
      .isIn(['add', 'subtract', 'adjustment'])
      .withMessage('Adjustment type must be one of: add, subtract, adjustment'),
    
    body('reason')
      .if(body('adjustment_amount').exists())
      .isString()
      .isLength({ min: 1, max: 500 })
      .withMessage('Reason is required when making adjustments')
  ]
};

// Custom validation middleware
const validatePaymentAmount = (req, res, next) => {
  const { amount, allocations } = req.body;
  
  if (allocations && allocations.length > 0) {
    const totalAllocated = allocations.reduce((sum, allocation) => {
      return sum + parseFloat(allocation.allocated_amount || 0);
    }, 0);
    
    if (totalAllocated > amount) {
      return res.status(400).json({
        success: false,
        message: 'Total allocated amount cannot exceed payment amount',
        errors: [{
          field: 'allocations',
          message: `Total allocated (${totalAllocated}) exceeds payment amount (${amount})`
        }]
      });
    }
  }
  
  next();
};

const validatePaymentMethodRequirements = async (req, res, next) => {
  try {
    const { payment_method_code, reference } = req.body;
    
    if (payment_method_code) {
      const PaymentMethod = require('../models/PaymentMethod');
      const method = await PaymentMethod.findByCode(payment_method_code);
      
      if (!method) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method',
          errors: [{
            field: 'payment_method_code',
            message: 'Payment method not found'
          }]
        });
      }
      
      if (!method.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Payment method is not active',
          errors: [{
            field: 'payment_method_code',
            message: 'This payment method is currently disabled'
          }]
        });
      }
      
      if (method.requires_reference && !reference) {
        return res.status(400).json({
          success: false,
          message: 'Reference is required for this payment method',
          errors: [{
            field: 'reference',
            message: `Reference is required for ${method.name} payments`
          }]
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ...paymentValidators,
  validatePaymentAmount,
  validatePaymentMethodRequirements
};