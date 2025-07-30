const { body, param, query } = require('express-validator');

const customerValidators = {
  createCustomer: [
    body('name')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name is required and must be between 1 and 255 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email must be valid'),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Phone must be a valid mobile number'),
    
    body('company')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Company name must be a string with maximum 255 characters'),
    
    body('address')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Address must be a string with maximum 1000 characters'),
    
    body('tax_number')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Tax number must be a string with maximum 50 characters'),
    
    body('type')
      .optional()
      .isIn(['individual', 'business'])
      .withMessage('Type must be either individual or business'),
    
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'blocked'])
      .withMessage('Status must be one of: active, inactive, blocked'),
    
    body('credit_limit')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Credit limit must be a non-negative number'),
    
    body('payment_terms')
      .optional()
      .isIn(['immediate', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90'])
      .withMessage('Payment terms must be a valid option'),
    
    body('preferred_language')
      .optional()
      .isIn(['en', 'ar'])
      .withMessage('Preferred language must be either en or ar')
  ],

  updateCustomer: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    body('name')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email must be valid'),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Phone must be a valid mobile number'),
    
    body('company')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Company name must be a string with maximum 255 characters'),
    
    body('address')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Address must be a string with maximum 1000 characters'),
    
    body('tax_number')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Tax number must be a string with maximum 50 characters'),
    
    body('type')
      .optional()
      .isIn(['individual', 'business'])
      .withMessage('Type must be either individual or business'),
    
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'blocked'])
      .withMessage('Status must be one of: active, inactive, blocked'),
    
    body('credit_limit')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Credit limit must be a non-negative number'),
    
    body('payment_terms')
      .optional()
      .isIn(['immediate', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90'])
      .withMessage('Payment terms must be a valid option'),
    
    body('preferred_language')
      .optional()
      .isIn(['en', 'ar'])
      .withMessage('Preferred language must be either en or ar')
  ],

  getCustomer: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ],

  deleteCustomer: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ],

  getCustomers: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'blocked'])
      .withMessage('Status must be one of: active, inactive, blocked'),
    
    query('type')
      .optional()
      .isIn(['individual', 'business'])
      .withMessage('Type must be either individual or business'),
    
    query('credit_status')
      .optional()
      .isIn(['good', 'warning', 'blocked'])
      .withMessage('Credit status must be one of: good, warning, blocked'),
    
    query('search')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Search term must be a string with maximum 255 characters'),
    
    query('sortBy')
      .optional()
      .isIn(['name', 'email', 'company', 'created_at', 'credit_limit'])
      .withMessage('Sort by must be a valid field'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be either asc or desc')
  ],

  updateCredit: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    body('amount')
      .isFloat()
      .withMessage('Amount must be a number'),
    
    body('type')
      .isIn(['add', 'subtract'])
      .withMessage('Type must be either add or subtract'),
    
    body('reason')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Reason must be a string with maximum 500 characters')
  ],

  getCreditHistory: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('type')
      .optional()
      .isIn(['add', 'subtract', 'adjustment', 'payment', 'refund'])
      .withMessage('Type must be a valid credit history type')
  ],

  getCustomerStats: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer')
  ]
};

// Custom validation middleware
const validateEmailUniqueness = async (req, res, next) => {
  try {
    const { email } = req.body;
    const customerId = req.params.id;
    
    if (email) {
      const Customer = require('../models/Customer');
      const existingCustomer = await Customer.findByEmail(email);
      
      if (existingCustomer && (!customerId || existingCustomer.id != customerId)) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
          errors: [{
            field: 'email',
            message: 'A customer with this email already exists'
          }]
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

const validateCreditOperation = (req, res, next) => {
  const { amount, type } = req.body;
  
  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be positive',
      errors: [{
        field: 'amount',
        message: 'Amount must be greater than zero'
      }]
    });
  }
  
  next();
};

module.exports = {
  ...customerValidators,
  validateEmailUniqueness,
  validateCreditOperation
};