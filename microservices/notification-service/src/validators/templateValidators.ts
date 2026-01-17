import { body } from 'express-validator';

export const templateValidators = {
  create: [
    body('name').isString().notEmpty().withMessage('Template name is required'),
    body('code').isString().notEmpty().withMessage('Template code is required'),
    body('title_template').isString().notEmpty().withMessage('Title template is required'),
    body('message_template').isString().notEmpty().withMessage('Message template is required'),
    body('type').optional().isIn(['info', 'success', 'warning', 'error', 'system']).withMessage('Invalid type'),
    body('category').optional().isIn(['order', 'payment', 'inventory', 'customer', 'system', 'alert']).withMessage('Invalid category'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('is_active').optional().isBoolean(),
  ],

  update: [
    body('name').optional().isString().notEmpty(),
    body('title_template').optional().isString().notEmpty(),
    body('message_template').optional().isString().notEmpty(),
    body('type').optional().isIn(['info', 'success', 'warning', 'error', 'system']),
    body('category').optional().isIn(['order', 'payment', 'inventory', 'customer', 'system', 'alert']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('is_active').optional().isBoolean(),
  ],
};
