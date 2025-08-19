import { ValidationChain, body } from 'express-validator';
import { BaseValidator } from './BaseValidator';
import { Request, Response, NextFunction } from 'express';

export class PaymentValidator extends BaseValidator {
  static readonly createPayment: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.customerIdField,
    BaseValidator.amountField,
    body('payment_method_code')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Payment method code is required and must be valid'),
    BaseValidator.dateField('payment_date'),
    BaseValidator.statusField(['pending', 'completed', 'failed', 'cancelled']).optional(),
    body('reference')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Reference must be a string with maximum 255 characters'),
    BaseValidator.notesField,
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
      .isIn(['invoice', 'sale', 'quotation'])
      .withMessage('Order type must be one of: invoice, sale, quotation'),
    body('allocations.*.allocated_amount')
      .if(body('allocations').exists())
      .isFloat({ min: 0.01 })
      .withMessage('Allocated amount must be a positive number'),
    body('allocations.*.order_total')
      .if(body('allocations').exists())
      .isFloat({ min: 0.01 })
      .withMessage('Order total must be a positive number')
  );

  static readonly updatePayment: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.commonIdParam,
    body('customer_id').optional(),
    body('amount').optional(),
    body('payment_method_code').optional(),
    body('payment_date').optional(),
    BaseValidator.statusField(['pending', 'completed', 'failed', 'cancelled']).optional(),
    body('reference').optional(),
    BaseValidator.notesField
  );

  static readonly getPayment: ValidationChain[] = [BaseValidator.commonIdParam];

  static readonly deletePayment: ValidationChain[] = [BaseValidator.commonIdParam];

  static readonly getPayments: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.paginationQuery,
    BaseValidator.dateRangeQuery,
    body('customer_id').optional().isInt({ min: 1 }),
    BaseValidator.statusField(['pending', 'completed', 'failed', 'cancelled']).optional(),
    body('payment_method_code')
      .optional()
      .isString()
      .withMessage('Payment method code must be a string'),
    body('search')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Search term must be a string with maximum 255 characters')
  );

  static readonly createAllocation: ValidationChain[] = BaseValidator.combineValidators(
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
      .isIn(['invoice', 'sale', 'quotation'])
      .withMessage('Order type must be one of: invoice, sale, quotation'),
    body('allocated_amount')
      .isFloat({ min: 0.01 })
      .withMessage('Allocated amount must be a positive number')
  );

  // Custom validators
  static validatePaymentAmount = (req: Request, res: Response, next: NextFunction) => {
    const { amount, allocations } = req.body;
    
    if (allocations && allocations.length > 0) {
      const totalAllocated = allocations.reduce((sum: number, allocation: any) => {
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

  static validatePaymentMethodRequirements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { payment_method_code, reference } = req.body;
      
      if (payment_method_code) {
        // This would need to be implemented with actual payment method validation
        // For now, we'll assume validation passes
        // In a real implementation, you would:
        // 1. Fetch payment method by code
        // 2. Check if it's active
        // 3. Validate requirements like reference
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}