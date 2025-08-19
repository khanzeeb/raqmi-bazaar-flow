import { ValidationChain, body } from 'express-validator';
import { BaseValidator } from './BaseValidator';
import { Request, Response, NextFunction } from 'express';

export class ReturnValidator extends BaseValidator {
  static readonly createReturn: ValidationChain[] = BaseValidator.combineValidators(
    body('sale_id')
      .isInt({ min: 1 })
      .withMessage('Sale ID must be a positive integer'),
    body('return_date')
      .isISO8601()
      .withMessage('Return date must be a valid date')
      .custom((value) => {
        const returnDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
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
    BaseValidator.notesField,
    BaseValidator.itemsArrayField,
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
      .isString()
      .isLength({ max: 500 })
      .withMessage('Item notes cannot exceed 500 characters')
  );

  static readonly updateReturn: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.commonIdParam,
    BaseValidator.statusField(['pending', 'approved', 'rejected', 'completed']).optional(),
    body('refund_status')
      .optional()
      .isIn(['pending', 'processed', 'cancelled'])
      .withMessage('Refund status must be one of: pending, processed, cancelled'),
    body('refund_amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Refund amount must be a non-negative number'),
    BaseValidator.notesField,
    body('processed_by')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Processed by must be a positive integer')
  );

  static readonly getReturn: ValidationChain[] = [BaseValidator.commonIdParam];

  static readonly getReturns: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.paginationQuery,
    BaseValidator.dateRangeQuery,
    body('customer_id').optional().isInt({ min: 1 }),
    BaseValidator.statusField(['pending', 'approved', 'rejected', 'completed']).optional(),
    body('return_type')
      .optional()
      .isIn(['full', 'partial'])
      .withMessage('Return type must be either "full" or "partial"')
  );

  static readonly deleteReturn: ValidationChain[] = [BaseValidator.commonIdParam];

  static readonly processReturn: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.commonIdParam,
    BaseValidator.statusField(['approved', 'rejected']),
    body('refund_amount')
      .if(body('status').equals('approved'))
      .isFloat({ min: 0 })
      .withMessage('Refund amount must be a non-negative number when approving'),
    BaseValidator.notesField
  );

  // Custom validator for return items
  static validateReturnItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, sale_id } = req.body;
      
      // This would need to be implemented with actual database access
      // For now, we'll assume validation passes
      // In a real implementation, you would:
      // 1. Fetch sale items for the given sale_id
      // 2. Validate each return item against sale items
      // 3. Check available quantities for return
      
      next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
  };
}