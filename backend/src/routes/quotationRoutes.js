const express = require('express');
const router = express.Router();
const QuotationController = require('../controllers/quotationController');
const { auth } = require('../middleware/auth');
const { 
  createQuotation, 
  updateQuotation, 
  getQuotation, 
  deleteQuotation, 
  getQuotations,
  updateQuotationStatus,
  validateValidityDateAfterQuotationDate,
  validateItemsTotal
} = require('../validators/quotationValidator');

// Quotation CRUD routes
router.post('/', 
  auth, 
  createQuotation, 
  validateValidityDateAfterQuotationDate,
  validateItemsTotal,
  QuotationController.createQuotation
);

router.get('/', auth, getQuotations, QuotationController.getQuotations);
router.get('/stats', auth, QuotationController.getQuotationStats);
router.get('/expired', auth, QuotationController.getExpiredQuotations);
router.get('/report', auth, QuotationController.getQuotationReport);
router.get('/:id', auth, getQuotation, QuotationController.getQuotation);

router.put('/:id', 
  auth, 
  updateQuotation, 
  validateValidityDateAfterQuotationDate,
  validateItemsTotal,
  QuotationController.updateQuotation
);

router.delete('/:id', auth, deleteQuotation, QuotationController.deleteQuotation);

// Quotation management routes
router.post('/:id/send', auth, QuotationController.sendQuotation);
router.post('/:id/accept', auth, QuotationController.acceptQuotation);
router.post('/:id/decline', auth, QuotationController.declineQuotation);
router.post('/:id/convert-to-sale', auth, QuotationController.convertToSale);

router.patch('/:id/status', 
  auth, 
  updateQuotationStatus, 
  QuotationController.updateQuotationStatus
);

// Batch operations
router.post('/process-expired', auth, QuotationController.processExpiredQuotations);

module.exports = router;