import { body } from 'express-validator';
import { BaseValidator } from './BaseValidator';

export class ExpenseValidator extends BaseValidator {
  create() {
    return [
      body('expense_date').isDate().withMessage('Valid expense date is required'),
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('description').optional().trim(),
      body('category')
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
      body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
      body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
      body('payment_method')
        .isIn(['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card'])
        .withMessage('Invalid payment method'),
      body('vendor').optional().trim(),
      body('notes').optional().trim(),
      this.handleValidationErrors
    ];
  }

  update() {
    return [
      body('expense_date').optional().isDate().withMessage('Valid expense date required'),
      body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
      body('description').optional().trim(),
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
      body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
      body('payment_method')
        .optional()
        .isIn(['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card'])
        .withMessage('Invalid payment method'),
      body('vendor').optional().trim(),
      body('notes').optional().trim(),
      this.handleValidationErrors
    ];
  }

  updateStatus() {
    return [
      body('status')
        .isIn(['pending', 'approved', 'paid', 'cancelled'])
        .withMessage('Invalid status'),
      this.handleValidationErrors
    ];
  }

  attachReceipt() {
    return [
      body('receipt_url').trim().notEmpty().withMessage('Receipt URL is required'),
      this.handleValidationErrors
    ];
  }
}
