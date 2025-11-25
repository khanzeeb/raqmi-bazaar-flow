import { body, param, query } from 'express-validator';

export class BaseValidator {
  static idParam() {
    return param('id').isInt().withMessage('ID must be a valid integer');
  }

  static paginationQuery() {
    return [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    ];
  }

  static dateQuery(field: string) {
    return query(field).optional().isISO8601().withMessage(`${field} must be a valid date`);
  }

  static stringBody(field: string, required: boolean = true) {
    const validator = body(field).isString().withMessage(`${field} must be a string`);
    return required ? validator.notEmpty().withMessage(`${field} is required`) : validator.optional();
  }

  static numberBody(field: string, required: boolean = true) {
    const validator = body(field).isNumeric().withMessage(`${field} must be a number`);
    return required ? validator.notEmpty().withMessage(`${field} is required`) : validator.optional();
  }

  static enumBody(field: string, values: any[], required: boolean = true) {
    const validator = body(field).isIn(values).withMessage(`${field} must be one of: ${values.join(', ')}`);
    return required ? validator.notEmpty().withMessage(`${field} is required`) : validator.optional();
  }
}
