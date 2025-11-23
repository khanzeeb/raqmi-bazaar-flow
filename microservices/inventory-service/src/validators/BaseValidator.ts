import { ValidationChain, body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export abstract class BaseValidator {
  // Validation error handler
  static handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }
    next();
  }
  // Common validation rules
  static readonly commonIdParam: ValidationChain = param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer');

  static readonly paginationQuery: ValidationChain[] = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ];

  static readonly dateRangeQuery: ValidationChain[] = [
    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('Date from must be a valid date'),
    
    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('Date to must be a valid date')
  ];

  static readonly sortingQuery: ValidationChain[] = [
    query('sortBy')
      .optional()
      .isString()
      .withMessage('Sort by must be a string'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ];

  // Common field validators
  static readonly customerIdField: ValidationChain = body('customer_id')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer');

  static readonly amountField: ValidationChain = body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number');

  static readonly dateField = (fieldName: string): ValidationChain => 
    body(fieldName)
      .isISO8601()
      .withMessage(`${fieldName} must be a valid date`);

  static readonly statusField = (validStatuses: string[]): ValidationChain =>
    body('status')
      .isIn(validStatuses)
      .withMessage(`Status must be one of: ${validStatuses.join(', ')}`);

  static readonly notesField: ValidationChain = body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be a string with maximum 1000 characters');

  // Item validation helpers
  static readonly itemsArrayField: ValidationChain = body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array');

  static readonly itemProductIdField: ValidationChain = body('items.*.product_id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer for each item');

  static readonly itemQuantityField: ValidationChain = body('items.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0 for each item');

  static readonly itemUnitPriceField: ValidationChain = body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number for each item');

  static readonly itemDiscountField: ValidationChain = body('items.*.discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a non-negative number');

  static readonly itemTaxField: ValidationChain = body('items.*.tax_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a non-negative number');

  // Combine common validators
  static combineValidators(...validators: (ValidationChain | ValidationChain[])[]): ValidationChain[] {
    return validators.flat();
  }
}