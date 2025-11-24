import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController';
import { createInvoiceValidator, updateInvoiceValidator, updateStatusValidator, recordPaymentValidator } from '../validators/invoiceValidator';

const router = Router();
const controller = new InvoiceController();

// Stats and reports (must come before /:id routes)
router.get('/stats/summary', controller.getStats);
router.get('/stats/by-status', controller.getByStatus);
router.post('/check-overdue', controller.checkOverdue);

// CRUD operations
router.route('/')
  .get(controller.getAll)
  .post(createInvoiceValidator, controller.create);

router.route('/:id')
  .get(controller.getById)
  .put(updateInvoiceValidator, controller.update)
  .delete(controller.delete);

// Status management
router.patch('/:id/status', updateStatusValidator, controller.updateStatus);
router.post('/:id/send', controller.markAsSent);
router.post('/:id/mark-paid', controller.markAsPaid);

// Payment and documents
router.post('/:id/payment', recordPaymentValidator, controller.recordPayment);
router.get('/:id/pdf', controller.generatePDF);
router.post('/:id/email', controller.sendEmail);

export default router;
