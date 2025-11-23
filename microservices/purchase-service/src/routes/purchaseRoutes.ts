import express from 'express';
import PurchaseController from '../controllers/PurchaseController';
import {
  createPurchaseValidator,
  updatePurchaseValidator,
  updatePurchaseStatusValidator,
  addPaymentValidator,
} from '../validators/purchaseValidator';

const router = express.Router();

router.get('/', PurchaseController.getPurchases);
router.post('/', createPurchaseValidator, PurchaseController.createPurchase);
router.get('/stats/summary', PurchaseController.getPurchaseStats);
router.get('/:id', PurchaseController.getPurchase);
router.put('/:id', updatePurchaseValidator, PurchaseController.updatePurchase);
router.delete('/:id', PurchaseController.deletePurchase);
router.patch('/:id/status', updatePurchaseStatusValidator, PurchaseController.updatePurchaseStatus);
router.post('/:id/receive', PurchaseController.receivePurchase);
router.post('/:id/payment', addPaymentValidator, PurchaseController.addPayment);

export default router;
