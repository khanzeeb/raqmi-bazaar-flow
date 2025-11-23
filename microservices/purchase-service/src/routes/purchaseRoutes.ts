import express from 'express';
import PurchaseController from '../controllers/PurchaseController';
import {
  createPurchaseValidator,
  updatePurchaseValidator,
  updatePurchaseStatusValidator,
  addPaymentValidator,
} from '../validators/purchaseValidator';

const router = express.Router();

// Stats route must come before :id to avoid matching "stats" as an id
router.get('/stats/summary', PurchaseController.getPurchaseStats);

// CRUD operations
router
  .route('/')
  .get(PurchaseController.getPurchases)
  .post(createPurchaseValidator, PurchaseController.createPurchase);

router
  .route('/:id')
  .get(PurchaseController.getPurchase)
  .put(updatePurchaseValidator, PurchaseController.updatePurchase)
  .delete(PurchaseController.deletePurchase);

// Purchase actions
router.patch('/:id/status', updatePurchaseStatusValidator, PurchaseController.updatePurchaseStatus);
router.post('/:id/receive', PurchaseController.receivePurchase);
router.post('/:id/payment', addPaymentValidator, PurchaseController.addPayment);

export default router;
