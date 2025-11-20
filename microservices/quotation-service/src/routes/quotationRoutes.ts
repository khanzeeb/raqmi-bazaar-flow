import express from 'express';
import { QuotationController } from '../controllers/QuotationController';
import { QuotationValidator } from '../validators/quotationValidator';

const router = express.Router();

// Quotation CRUD routes
router.post(
  '/',
  QuotationValidator.createQuotation,
  QuotationValidator.handleValidationErrors,
  QuotationValidator.validateValidityDateAfterQuotationDate,
  QuotationValidator.validateItemsTotal,
  QuotationController.createQuotation
);

router.get(
  '/',
  QuotationValidator.getQuotations,
  QuotationValidator.handleValidationErrors,
  QuotationController.getQuotations
);

router.get('/stats', QuotationController.getQuotationStats);
router.get('/expired', QuotationController.getExpiredQuotations);
router.get('/report', QuotationController.getQuotationReport);

router.get(
  '/:id',
  QuotationValidator.getQuotation,
  QuotationValidator.handleValidationErrors,
  QuotationController.getQuotation
);

router.put(
  '/:id',
  QuotationValidator.updateQuotation,
  QuotationValidator.handleValidationErrors,
  QuotationValidator.validateValidityDateAfterQuotationDate,
  QuotationValidator.validateItemsTotal,
  QuotationController.updateQuotation
);

router.delete(
  '/:id',
  QuotationValidator.deleteQuotation,
  QuotationValidator.handleValidationErrors,
  QuotationController.deleteQuotation
);

// Quotation management routes
router.post('/:id/send', QuotationController.sendQuotation);
router.post('/:id/accept', QuotationController.acceptQuotation);
router.post('/:id/decline', QuotationController.declineQuotation);
router.post('/:id/convert-to-sale', QuotationController.convertToSale);

router.patch(
  '/:id/status',
  QuotationValidator.updateQuotationStatus,
  QuotationValidator.handleValidationErrors,
  QuotationController.updateQuotationStatus
);

// Batch operations
router.post('/process-expired', QuotationController.processExpiredQuotations);

export default router;
