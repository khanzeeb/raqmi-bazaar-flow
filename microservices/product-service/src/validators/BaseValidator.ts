import { body, param } from 'express-validator';

export class BaseValidator {
  static uuid(field: string, message?: string) {
    return param(field)
      .isUUID()
      .withMessage(message || `${field} must be a valid UUID`);
  }

  static requiredString(field: string, minLength = 1, maxLength = 255) {
    return body(field)
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`);
  }

  static optionalString(field: string, maxLength = 255) {
    return body(field)
      .optional()
      .trim()
      .isLength({ max: maxLength })
      .withMessage(`${field} must not exceed ${maxLength} characters`);
  }

  static requiredNumber(field: string, min = 0) {
    return body(field)
      .isFloat({ min })
      .withMessage(`${field} must be a number greater than or equal to ${min}`);
  }

  static optionalNumber(field: string, min = 0) {
    return body(field)
      .optional()
      .isFloat({ min })
      .withMessage(`${field} must be a number greater than or equal to ${min}`);
  }

  static requiredInteger(field: string, min = 0) {
    return body(field)
      .isInt({ min })
      .withMessage(`${field} must be an integer greater than or equal to ${min}`);
  }

  static optionalInteger(field: string, min = 0) {
    return body(field)
      .optional()
      .isInt({ min })
      .withMessage(`${field} must be an integer greater than or equal to ${min}`);
  }

  static enum(field: string, values: string[], required = false) {
    const validator = required ? body(field) : body(field).optional();
    return validator
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`);
  }

  static array(field: string, required = false) {
    const validator = required ? body(field) : body(field).optional();
    return validator
      .isArray()
      .withMessage(`${field} must be an array`);
  }

  static object(field: string, required = false) {
    const validator = required ? body(field) : body(field).optional();
    return validator
      .isObject()
      .withMessage(`${field} must be an object`);
  }
}