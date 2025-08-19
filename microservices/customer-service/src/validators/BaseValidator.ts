import { body, query, param } from 'express-validator';

export class BaseValidator {
  static positiveNumber(field: string, message?: string) {
    return body(field)
      .isFloat({ min: 0 })
      .withMessage(message || `${field} must be a positive number`);
  }

  static requiredString(field: string, message?: string) {
    return body(field)
      .notEmpty()
      .withMessage(message || `${field} is required`)
      .isString()
      .withMessage(message || `${field} must be a string`)
      .trim();
  }

  static optionalString(field: string, message?: string) {
    return body(field)
      .optional()
      .isString()
      .withMessage(message || `${field} must be a string`)
      .trim();
  }

  static email(field: string = 'email', message?: string) {
    return body(field)
      .optional()
      .isEmail()
      .withMessage(message || `${field} must be a valid email`)
      .normalizeEmail();
  }

  static enumValue(field: string, values: string[], message?: string) {
    return body(field)
      .optional()
      .isIn(values)
      .withMessage(message || `${field} must be one of: ${values.join(', ')}`);
  }

  static id(field: string = 'id', message?: string) {
    return param(field)
      .isUUID()
      .withMessage(message || `${field} must be a valid UUID`);
  }

  static pagination() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page must be a positive integer'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit must be between 1 and 100')
    ];
  }

  static sortOrder() {
    return [
      query('sortBy')
        .optional()
        .isString()
        .withMessage('sortBy must be a string'),
      query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('sortOrder must be either asc or desc')
    ];
  }
}