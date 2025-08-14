import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const createReturn: ValidationChain[] = [
  body('sale_id')
    .isInt({ min: 1 })
    .withMessage('Sale ID must be a positive integer'),
  
  body('return_date')
    .isISO8601()
    .withMessage('Return date must be a valid date')
    .custom((value, { req }) => {
      const returnDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (returnDate > today) {
        throw new Error('Return date cannot be in the future');
      }
      return true;
    }),
  
  body('return_type')
    .isIn(['full', 'partial'])
    .withMessage('Return type must be either "full" or "partial"'),
  
  body('reason')
    .isIn(['defective', 'wrong_item', 'not_needed', 'damaged', 'other'])
    .withMessage('Reason must be one of: defective, wrong_item, not_needed, damaged, other'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.sale_item_id')
    .isInt({ min: 1 })
    .withMessage('Sale item ID must be a positive integer'),
  
  body('items.*.quantity_returned')
    .isInt({ min: 1 })
    .withMessage('Quantity returned must be a positive integer'),
  
  body('items.*.condition')
    .isIn(['good', 'damaged', 'defective', 'unopened'])
    .withMessage('Condition must be one of: good, damaged, defective, unopened'),
  
  body('items.*.notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Item notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

const updateReturn: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Return ID must be a positive integer'),
  
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'completed'])
    .withMessage('Status must be one of: pending, approved, rejected, completed'),
  
  body('refund_status')
    .optional()
    .isIn(['pending', 'processed', 'cancelled'])
    .withMessage('Refund status must be one of: pending, processed, cancelled'),
  
  body('refund_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be a non-negative number'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('processed_by')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Processed by must be a positive integer'),
  
  handleValidationErrors
];

const getReturn: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Return ID must be a positive integer'),
  
  handleValidationErrors
];

const getReturns: ValidationChain[] = [
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
    .isIn(['pending', 'approved', 'rejected', 'completed'])
    .withMessage('Status must be one of: pending, approved, rejected, completed'),
  
  query('return_type')
    .optional()
    .isIn(['full', 'partial'])
    .withMessage('Return type must be either "full" or "partial"'),
  
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date'),
  
  handleValidationErrors
];

const deleteReturn: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Return ID must be a positive integer'),
  
  handleValidationErrors
];

const processReturn: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Return ID must be a positive integer'),
  
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either "approved" or "rejected"'),
  
  body('refund_amount')
    .if(body('status').equals('approved'))
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be a non-negative number when approving'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  handleValidationErrors
];

const validateReturnItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, sale_id } = req.body;
    
    // Get sale items for validation
    const { SaleItem } = require('../models/SaleItem');
    const saleItems = await SaleItem.findBySaleId(sale_id);
    
    if (!saleItems || saleItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items found for this sale'
      });
    }
    
    // Validate each return item
    for (const item of items) {
      const saleItem = saleItems.find((si: any) => si.id === item.sale_item_id);
      
      if (!saleItem) {
        return res.status(400).json({
          success: false,
          message: `Sale item ${item.sale_item_id} not found in this sale`
        });
      }
      
      // Check if quantity returned exceeds available quantity
      const { ReturnItem } = require('../models/ReturnItem');
      const returnStats = await ReturnItem.getSaleItemReturnStats(item.sale_item_id);
      const alreadyReturned = returnStats?.total_quantity_returned || 0;
      const availableQuantity = saleItem.quantity - alreadyReturned;
      
      if (item.quantity_returned > availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot return ${item.quantity_returned} of item "${saleItem.product_name}". Only ${availableQuantity} available for return.`
        });
      }
    }
    
    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

export = {
  createReturn,
  updateReturn,
  getReturn,
  getReturns,
  deleteReturn,
  processReturn,
  validateReturnItems
};