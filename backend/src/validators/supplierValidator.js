const { body, param, query } = require('express-validator');

const createSupplier = [
  body('name')
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Supplier name must be between 1 and 255 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  
  body('contact_person')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Contact person name must not exceed 255 characters'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  
  body('postal_code')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Postal code must not exceed 20 characters'),
  
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-character country code'),
  
  body('tax_id')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Tax ID must not exceed 50 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  
  body('credit_limit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be a positive number'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

const updateSupplier = [
  param('id')
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID'),
  
  body('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Supplier name must be between 1 and 255 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  
  body('contact_person')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Contact person name must not exceed 255 characters'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  
  body('postal_code')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Postal code must not exceed 20 characters'),
  
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-character country code'),
  
  body('tax_id')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Tax ID must not exceed 50 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  
  body('credit_limit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be a positive number'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

const getSupplier = [
  param('id')
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID')
];

const deleteSupplier = [
  param('id')
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID')
];

const getSuppliers = [
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
    .isIn(['name', 'email', 'city', 'country', 'status', 'created_at'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status filter'),
  
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-character country code')
];

module.exports = {
  createSupplier,
  updateSupplier,
  getSupplier,
  deleteSupplier,
  getSuppliers
};