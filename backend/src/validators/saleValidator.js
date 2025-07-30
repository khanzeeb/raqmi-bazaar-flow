const { body, param, query } = require('express-validator');

const createSale = [
  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  
  body('sale_date')
    .notEmpty()
    .withMessage('Sale date is required')
    .isISO8601()
    .withMessage('Sale date must be a valid date'),
  
  body('due_date')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required and must contain at least one item'),
  
  body('items.*.product_id')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  
  body('items.*.unit_price')
    .notEmpty()
    .withMessage('Unit price is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  
  body('items.*.discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  
  body('items.*.tax_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a positive number'),
  
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
    .isFloat({ min: 0.01 })
    .withMessage('Total amount must be greater than 0'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  
  body('terms_conditions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Terms and conditions must not exceed 2000 characters')
];

const updateSale = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Sale ID must be a positive integer'),
  
  body('customer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  
  body('sale_date')
    .optional()
    .isISO8601()
    .withMessage('Sale date must be a valid date'),
  
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one item'),
  
  body('items.*.product_id')
    .if(body('items').exists())
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  
  body('items.*.quantity')
    .if(body('items').exists())
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  
  body('items.*.unit_price')
    .if(body('items').exists())
    .notEmpty()
    .withMessage('Unit price is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  
  body('subtotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
  
  body('total_amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Total amount must be greater than 0'),
  
  body('status')
    .optional()
    .isIn(['draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status value')
];

const getSale = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Sale ID must be a positive integer')
];

const deleteSale = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Sale ID must be a positive integer')
];

const getSales = [
  query('customer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  
  query('status')
    .optional()
    .isIn(['draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status value'),
  
  query('payment_status')
    .optional()
    .isIn(['unpaid', 'partially_paid', 'paid', 'overpaid'])
    .withMessage('Invalid payment status value'),
  
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date'),
  
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
    .isIn(['sale_number', 'customer_name', 'sale_date', 'due_date', 'total_amount', 'status', 'created_at'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const createSalePayment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Sale ID must be a positive integer'),
  
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  
  body('payment_method_code')
    .notEmpty()
    .withMessage('Payment method is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Payment method code must be between 1 and 50 characters'),
  
  body('payment_date')
    .notEmpty()
    .withMessage('Payment date is required')
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  
  body('reference')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Reference must not exceed 255 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

// Custom validator to check if due date is after sale date
const validateDueDateAfterSaleDate = (req, res, next) => {
  const { sale_date, due_date } = req.body;
  
  if (sale_date && due_date) {
    const saleDate = new Date(sale_date);
    const dueDateObj = new Date(due_date);
    
    if (dueDateObj < saleDate) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be on or after sale date',
        errors: [{ 
          field: 'due_date', 
          message: 'Due date must be on or after sale date' 
        }]
      });
    }
  }
  
  next();
};

// Custom validator to check if items total matches sale total
const validateItemsTotal = (req, res, next) => {
  const { items, subtotal, tax_amount = 0, discount_amount = 0, total_amount } = req.body;
  
  if (items && items.length > 0) {
    let calculatedSubtotal = 0;
    let calculatedTax = 0;
    let calculatedDiscount = 0;
    
    for (const item of items) {
      const lineTotal = item.quantity * item.unit_price;
      calculatedSubtotal += lineTotal;
      calculatedTax += item.tax_amount || 0;
      calculatedDiscount += item.discount_amount || 0;
    }
    
    const calculatedTotal = calculatedSubtotal + calculatedTax - calculatedDiscount;
    
    // Allow small rounding differences (1 cent)
    if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Subtotal does not match items total',
        errors: [{ 
          field: 'subtotal', 
          message: `Calculated subtotal: ${calculatedSubtotal.toFixed(2)}, provided: ${subtotal}` 
        }]
      });
    }
    
    if (Math.abs(calculatedTotal - total_amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Total amount does not match calculated total',
        errors: [{ 
          field: 'total_amount', 
          message: `Calculated total: ${calculatedTotal.toFixed(2)}, provided: ${total_amount}` 
        }]
      });
    }
  }
  
  next();
};

module.exports = {
  createSale,
  updateSale,
  getSale,
  deleteSale,
  getSales,
  createSalePayment,
  validateDueDateAfterSaleDate,
  validateItemsTotal
};