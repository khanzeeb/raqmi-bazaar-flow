const { body, param, query } = require('express-validator');

const createExpense = [
  body('expense_date')
    .notEmpty()
    .withMessage('Expense date is required')
    .isISO8601()
    .withMessage('Expense date must be a valid date'),
  
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'office_supplies',
      'utilities',
      'rent',
      'marketing',
      'travel',
      'meals',
      'software',
      'equipment',
      'professional_services',
      'insurance',
      'taxes',
      'other'
    ])
    .withMessage('Invalid category'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('payment_method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card'])
    .withMessage('Invalid payment method'),
  
  body('vendor')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Vendor name must not exceed 255 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'paid', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

const updateExpense = [
  param('id')
    .isUUID()
    .withMessage('Expense ID must be a valid UUID'),
  
  body('expense_date')
    .optional()
    .isISO8601()
    .withMessage('Expense date must be a valid date'),
  
  body('title')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('category')
    .optional()
    .isIn([
      'office_supplies',
      'utilities',
      'rent',
      'marketing',
      'travel',
      'meals',
      'software',
      'equipment',
      'professional_services',
      'insurance',
      'taxes',
      'other'
    ])
    .withMessage('Invalid category'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('payment_method')
    .optional()
    .isIn(['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card'])
    .withMessage('Invalid payment method'),
  
  body('vendor')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Vendor name must not exceed 255 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'paid', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

const getExpense = [
  param('id')
    .isUUID()
    .withMessage('Expense ID must be a valid UUID')
];

const deleteExpense = [
  param('id')
    .isUUID()
    .withMessage('Expense ID must be a valid UUID')
];

const getExpenses = [
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
    .isIn(['expense_date', 'amount', 'category', 'status', 'created_at'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('category')
    .optional()
    .isIn([
      'office_supplies',
      'utilities',
      'rent',
      'marketing',
      'travel',
      'meals',
      'software',
      'equipment',
      'professional_services',
      'insurance',
      'taxes',
      'other'
    ])
    .withMessage('Invalid category filter'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'paid', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('vendor')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Vendor filter must not exceed 255 characters'),
  
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const updateExpenseStatus = [
  param('id')
    .isUUID()
    .withMessage('Expense ID must be a valid UUID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'approved', 'paid', 'cancelled'])
    .withMessage('Invalid status')
];

module.exports = {
  createExpense,
  updateExpense,
  getExpense,
  deleteExpense,
  getExpenses,
  updateExpenseStatus
};