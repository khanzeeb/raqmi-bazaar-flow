import { ValidationChain, body } from 'express-validator';
import { BaseValidator } from './BaseValidator';
import { Request, Response, NextFunction } from 'express';

export class QuotationValidator extends BaseValidator {
  static readonly createQuotation: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.customerIdField,
    BaseValidator.dateField('quotation_date'),
    BaseValidator.dateField('validity_date'),
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

  static readonly updateQuotation: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.commonIdParam,
    body('customer_id').optional(),
    body('quotation_date').optional(),
    body('validity_date').optional(),
    body('items').optional(),
    body('subtotal').optional(),
    body('total_amount').optional(),
    BaseValidator.statusField(['draft', 'sent', 'accepted', 'declined', 'expired', 'converted']).optional()
  );

  static readonly getQuotation: ValidationChain[] = [BaseValidator.commonIdParam];

  static readonly deleteQuotation: ValidationChain[] = [BaseValidator.commonIdParam];

  static readonly getQuotations: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.paginationQuery,
    BaseValidator.dateRangeQuery,
    BaseValidator.sortingQuery,
    body('customer_id').optional().isInt({ min: 1 }),
    BaseValidator.statusField(['draft', 'sent', 'accepted', 'declined', 'expired', 'converted']).optional()
  );

  static readonly updateQuotationStatus: ValidationChain[] = BaseValidator.combineValidators(
    BaseValidator.commonIdParam,
    BaseValidator.statusField(['draft', 'sent', 'accepted', 'declined', 'expired', 'converted'])
  );

  // Custom validators
  static validateValidityDateAfterQuotationDate = (req: Request, res: Response, next: NextFunction) => {
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