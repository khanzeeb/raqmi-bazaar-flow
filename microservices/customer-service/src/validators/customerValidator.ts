import { body } from 'express-validator';
import { BaseValidator } from './BaseValidator';

const customerTypes = ['individual', 'business'];
const customerStatuses = ['active', 'inactive', 'blocked'];
const creditStatuses = ['good', 'warning', 'blocked'];
const paymentTerms = ['immediate', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90'];
const languages = ['en', 'ar'];

export const customerValidators = {
  create: [
    BaseValidator.requiredString('name', 'Customer name is required'),
    BaseValidator.email('email'),
    BaseValidator.optionalString('phone'),
    BaseValidator.optionalString('company'),
    BaseValidator.optionalString('address'),
    BaseValidator.optionalString('tax_number'),
    BaseValidator.enumValue('type', customerTypes),
    BaseValidator.enumValue('status', customerStatuses),
    BaseValidator.positiveNumber('credit_limit'),
    BaseValidator.enumValue('payment_terms', paymentTerms),
    BaseValidator.enumValue('preferred_language', languages)
  ],

  update: [
    BaseValidator.optionalString('name'),
    BaseValidator.email('email'),
    BaseValidator.optionalString('phone'),
    BaseValidator.optionalString('company'),
    BaseValidator.optionalString('address'),
    BaseValidator.optionalString('tax_number'),
    BaseValidator.enumValue('type', customerTypes),
    BaseValidator.enumValue('status', customerStatuses),
    BaseValidator.positiveNumber('credit_limit'),
    BaseValidator.enumValue('payment_terms', paymentTerms),
    BaseValidator.enumValue('preferred_language', languages)
  ],

  updateCredit: [
    BaseValidator.positiveNumber('amount', 'Amount must be a positive number'),
    body('type')
      .isIn(['add', 'subtract'])
      .withMessage('Type must be either add or subtract'),
    BaseValidator.optionalString('reason')
  ],

  block: [
    BaseValidator.optionalString('reason')
  ],

  unblock: [
    BaseValidator.optionalString('reason')
  ]
};