import express from 'express';
import TranslationController from '../controllers/translationController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createTranslationValidator,
  updateTranslationValidator,
  bulkImportValidator
} from '../validators/translationValidator';

const router = express.Router();

// Public routes - get translations
router.get('/', TranslationController.getTranslations);
router.get('/export', TranslationController.exportTranslations);
router.get('/:id', TranslationController.getTranslation);

// Protected routes
router.use(authenticate);

// Admin and Manager only routes
router.post('/', 
  authorize('admin', 'manager'), 
  createTranslationValidator, 
  TranslationController.createTranslation
);

router.put('/:id', 
  authorize('admin', 'manager'), 
  updateTranslationValidator, 
  TranslationController.updateTranslation
);

router.delete('/:id', 
  authorize('admin', 'manager'), 
  TranslationController.deleteTranslation
);

router.post('/bulk-import', 
  authorize('admin', 'manager'), 
  bulkImportValidator, 
  TranslationController.bulkImport
);

router.post('/sync', 
  authorize('admin'), 
  TranslationController.syncTranslations
);

export default router;