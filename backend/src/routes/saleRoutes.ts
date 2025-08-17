import express from 'express';
import { SaleController } from '../controllers/saleController';
import { auth } from '../middleware/auth';
import { 
  createSale, 
  updateSale, 
  getSale, 
  deleteSale, 
  getSales,
  createSalePayment,
  validateDueDateAfterSaleDate,
  validateItemsTotal
} from '../validators/saleValidator';

const router = express.Router();

// Sale CRUD routes
router.post('/', 
  auth, 
  createSale, 
  validateDueDateAfterSaleDate,
  validateItemsTotal,
  SaleController.createSale
);

router.get('/', auth, getSales, SaleController.getSales);
router.get('/stats', auth, SaleController.getSaleStats);
router.get('/overdue', auth, SaleController.getOverdueSales);
router.get('/report', auth, SaleController.getSaleReport);
router.get('/:id', auth, getSale, SaleController.getSale);

router.put('/:id', 
  auth, 
  updateSale, 
  validateDueDateAfterSaleDate,
  validateItemsTotal,
  SaleController.updateSale
);

router.delete('/:id', auth, deleteSale, SaleController.deleteSale);

// Payment routes for sales
router.post('/:id/payments', 
  auth, 
  createSalePayment, 
  SaleController.createSalePayment
);

router.post('/:id/payments/partial', 
  auth, 
  createSalePayment, 
  SaleController.createPartialPayment
);

router.post('/:id/payments/full', 
  auth, 
  createSalePayment, 
  SaleController.createFullPayment
);

router.post('/:id/allocate-payment', 
  auth, 
  SaleController.allocatePayment
);

// Sale management routes
router.post('/:id/cancel', auth, SaleController.cancelSale);
router.post('/process-overdue-reminders', auth, SaleController.processOverdueReminders);

// Return-related routes
router.get('/:id/returns', auth, SaleController.getSaleReturns);
router.get('/:id/state/before-return/:returnId?', auth, SaleController.getSaleStateBeforeReturn);
router.get('/:id/state/after-return/:returnId', auth, SaleController.getSaleStateAfterReturn);

export default router;