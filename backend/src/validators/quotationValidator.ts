import { body, param, query, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const createQuotation: ValidationChain[] = [
  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  
  body('quotation_date')
    .notEmpty()
    .withMessage('Quotation date is required')
    .isISO8601()
    .withMessage('Quotation date must be a valid date'),
  
  body('validity_date')
    .notEmpty()
    .withMessage('Validity date is required')
    .isISO8601()
    .withMessage('Validity date must be a valid date'),
  
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

const updateQuotation: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Quotation ID must be a positive integer'),
  
  body('customer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  
  body('quotation_date')
    .optional()
    .isISO8601()
    .withMessage('Quotation date must be a valid date'),
  
  body('validity_date')
    .optional()
    .isISO8601()
    .withMessage('Validity date must be a valid date'),
  
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
    .isIn(['draft', 'sent', 'accepted', 'declined', 'expired', 'converted'])
    .withMessage('Invalid status value')
];

const getQuotation: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Quotation ID must be a positive integer')
];

const deleteQuotation: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Quotation ID must be a positive integer')
];

const getQuotations: ValidationChain[] = [
  query('customer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  
  query('status')
    .optional()
    .isIn(['draft', 'sent', 'accepted', 'declined', 'expired', 'converted'])
    .withMessage('Invalid status value'),
  
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
    .isIn(['quotation_number', 'customer_name', 'quotation_date', 'validity_date', 'total_amount', 'status', 'created_at'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const updateQuotationStatus: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Quotation ID must be a positive integer'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'sent', 'accepted', 'declined', 'expired', 'converted'])
    .withMessage('Invalid status value')
];

// Custom validator to check if validity date is after quotation date
const validateValidityDateAfterQuotationDate = (req: Request, res: Response, next: NextFunction) => {
  const { quotation_date, validity_date } = req.body;
  
  if (quotation_date && validity_date) {
    const quotationDate = new Date(quotation_date);
    const validityDateObj = new Date(validity_date);
    
    if (validityDateObj < quotationDate) {
      return res.status(400).json({
        success: false,
        message: 'Validity date must be on or after quotation date',
        errors: [{ 
          field: 'validity_date', 
          message: 'Validity date must be on or after quotation date' 
        }]
      });
    }
  }
  
  next();
};

// Custom validator to check if items total matches quotation total
const validateItemsTotal = (req: Request, res: Response, next: NextFunction) => {
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

export = {
  createQuotation,
  updateQuotation,
  getQuotation,
  deleteQuotation,
  getQuotations,
  updateQuotationStatus,
  validateValidityDateAfterQuotationDate,
  validateItemsTotal
};