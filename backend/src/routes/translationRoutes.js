const express = require('express');
const router = express.Router();
const TranslationController = require('../controllers/translationController');
const { 
  createTranslationValidator, 
  updateTranslationValidator, 
  bulkImportValidator 
} = require('../validators/translationValidator');
const auth = require('../middleware/auth');

// Get all translations (with optional filters)
router.get('/', TranslationController.getAllTranslations);

// Get translations grouped by category
router.get('/grouped', TranslationController.getGroupedTranslations);

// Get all categories
router.get('/categories', TranslationController.getCategories);

// Get translation by key
router.get('/key/:key', TranslationController.getTranslationByKey);

// Create new translation (protected)
router.post('/', auth, createTranslationValidator, TranslationController.createTranslation);

// Update translation (protected)
router.put('/:id', auth, updateTranslationValidator, TranslationController.updateTranslation);

// Delete translation (protected)
router.delete('/:id', auth, TranslationController.deleteTranslation);

// Bulk import translations (protected)
router.post('/bulk-import', auth, bulkImportValidator, TranslationController.bulkImport);

module.exports = router;