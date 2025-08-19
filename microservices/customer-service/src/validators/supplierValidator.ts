import { BaseValidator } from './BaseValidator';

const supplierStatuses = ['active', 'inactive'];

export const supplierValidators = {
  create: [
    BaseValidator.requiredString('name', 'Supplier name is required'),
    BaseValidator.email('email'),
    BaseValidator.optionalString('phone'),
    BaseValidator.optionalString('contact_person'),
    BaseValidator.optionalString('address'),
    BaseValidator.optionalString('country'),
    BaseValidator.optionalString('tax_number'),
    BaseValidator.enumValue('status', supplierStatuses),
    BaseValidator.positiveNumber('credit_limit'),
    BaseValidator.optionalString('payment_terms'),
    BaseValidator.optionalString('notes')
  ],

  update: [
    BaseValidator.optionalString('name'),
    BaseValidator.email('email'),
    BaseValidator.optionalString('phone'),
    BaseValidator.optionalString('contact_person'),
    BaseValidator.optionalString('address'),
    BaseValidator.optionalString('country'),
    BaseValidator.optionalString('tax_number'),
    BaseValidator.enumValue('status', supplierStatuses),
    BaseValidator.positiveNumber('credit_limit'),
    BaseValidator.optionalString('payment_terms'),
    BaseValidator.optionalString('notes')
  ]
};