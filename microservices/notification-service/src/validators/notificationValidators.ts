import { body } from 'express-validator';

export const notificationValidators = {
  create: [
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['info', 'success', 'warning', 'error', 'system']).withMessage('Invalid notification type'),
    body('category').optional().isIn(['order', 'payment', 'inventory', 'customer', 'system', 'alert']).withMessage('Invalid category'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('link').optional().isString(),
    body('expires_at').optional().isISO8601(),
  ],

  createFromTemplate: [
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('template_code').isString().notEmpty().withMessage('Template code is required'),
    body('variables').isObject().withMessage('Variables must be an object'),
  ],

  createBulk: [
    body('user_ids').isArray({ min: 1 }).withMessage('At least one user ID is required'),
    body('user_ids.*').isString().notEmpty(),
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['info', 'success', 'warning', 'error', 'system']),
    body('category').optional().isIn(['order', 'payment', 'inventory', 'customer', 'system', 'alert']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  ],

  markAllRead: [
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('organization_id').optional().isString(),
  ],

  cleanup: [
    body('days_old').optional().isInt({ min: 1 }).withMessage('Days must be a positive integer'),
  ],
};
