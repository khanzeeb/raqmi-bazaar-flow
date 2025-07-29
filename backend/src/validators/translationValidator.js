const { body } = require('express-validator');

const createTranslationValidator = [
  body('key')
    .notEmpty()
    .withMessage('Translation key is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Key must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Key can only contain letters, numbers, dots, hyphens, and underscores'),
  
  body('en')
    .notEmpty()
    .withMessage('English translation is required')
    .isLength({ max: 5000 })
    .withMessage('English translation cannot exceed 5000 characters'),
  
  body('ar')
    .notEmpty()
    .withMessage('Arabic translation is required')
    .isLength({ max: 5000 })
    .withMessage('Arabic translation cannot exceed 5000 characters'),
  
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

const updateTranslationValidator = [
  body('key')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Key must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Key can only contain letters, numbers, dots, hyphens, and underscores'),
  
  body('en')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('English translation cannot exceed 5000 characters'),
  
  body('ar')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Arabic translation cannot exceed 5000 characters'),
  
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

const bulkImportValidator = [
  body('translations')
    .isArray()
    .withMessage('Translations must be an array'),
  
  body('translations.*.key')
    .notEmpty()
    .withMessage('Each translation must have a key')
    .isLength({ min: 1, max: 255 })
    .withMessage('Key must be between 1 and 255 characters'),
  
  body('translations.*.en')
    .notEmpty()
    .withMessage('Each translation must have English text'),
  
  body('translations.*.ar')
    .notEmpty()
    .withMessage('Each translation must have Arabic text')
];

module.exports = {
  createTranslationValidator,
  updateTranslationValidator,
  bulkImportValidator
};