import express from 'express';
import PurchaseController from '../controllers/purchaseController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createPurchaseValidator,
  updatePurchaseValidator,
  updatePurchaseStatusValidator
} from '../validators/purchaseValidator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Purchase management routes
router.get('/', PurchaseController.getPurchases);
router.post('/', 
  authorize('admin', 'manager'), 
  createPurchaseValidator, 
  PurchaseController.createPurchase
);

router.get('/:id', PurchaseController.getPurchase);
router.put('/:id', 
  authorize('admin', 'manager'), 
  updatePurchaseValidator, 
  PurchaseController.updatePurchase
);

router.delete('/:id', 
  authorize('admin', 'manager'), 
  PurchaseController.deletePurchase
);

// Purchase status management
router.patch('/:id/status', 
  authorize('admin', 'manager'), 
  updatePurchaseStatusValidator, 
  PurchaseController.updatePurchaseStatus
);

// Purchase receiving
router.post('/:id/receive', 
  authorize('admin', 'manager'), 
  PurchaseController.receivePurchase
);

// Purchase statistics
router.get('/stats/summary', PurchaseController.getPurchaseStats);

export default router;