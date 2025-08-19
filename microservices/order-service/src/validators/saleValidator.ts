import { ValidationChain, body } from 'express-validator';
import { BaseValidator } from './BaseValidator';
import { Request, Response, NextFunction } from 'express';

export class SaleValidator extends BaseValidator {
  static readonly createSale: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.customerIdField,
    BaseValidator.dateField('sale_date'),
    BaseValidator.dateField('due_date'),
    BaseValidator.itemsArrayField,
    BaseValidator.itemProductIdField,
    BaseValidator.itemQuantityField,
    BaseValidator.itemUnitPriceField,
    BaseValidator.itemDiscountField,
    BaseValidator.itemTaxField,
    body('subtotal')
      .isFloat({ min: 0 })
      .withMessage('Subtotal must be a non-negative number'),
    body('total_amount')
      .isFloat({ min: 0.01 })
      .withMessage('Total amount must be greater than 0'),
    body('tax_amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax amount must be a non-negative number'),
    body('discount_amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Discount amount must be a non-negative number'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-character code'),
    BaseValidator.notesField,
    body('terms_conditions')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Terms and conditions must not exceed 2000 characters')
  );

  static readonly updateSale: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.commonIdParam,
    body('customer_id').optional(),
    body('sale_date').optional(),
    body('due_date').optional(),
    body('items').optional(),
    body('subtotal').optional(),
    body('total_amount').optional(),
    BaseValidator.statusField(['draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled']).optional()
  );

  static readonly getSale: ValidationChain[] = [BaseValidator.commonIdParam];

  static readonly deleteSale: ValidationChain[] = [BaseValidator.commonIdParam];

  static readonly getSales: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.paginationQuery,
    BaseValidator.dateRangeQuery,
    BaseValidator.sortingQuery,
    body('customer_id').optional().isInt({ min: 1 }),
    BaseValidator.statusField(['draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled']).optional()
  );

  static readonly createSalePayment: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.commonIdParam,
    BaseValidator.amountField,
    body('payment_method_code')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Payment method code is required'),
    BaseValidator.dateField('payment_date'),
    body('reference')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Reference must not exceed 255 characters'),
    BaseValidator.notesField
  );

  // Custom validators
  static validateDueDateAfterSaleDate = (req: Request, res: Response, next: NextFunction) => {
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

  static validateItemsTotal = (req: Request, res: Response, next: NextFunction) => {
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
}