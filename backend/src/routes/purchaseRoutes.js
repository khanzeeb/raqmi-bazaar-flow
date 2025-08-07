const express = require('express');
const router = express.Router();
const PurchaseController = require('../controllers/purchaseController');
const { auth } = require('../middleware/auth');
const { 
  createPurchase, 
  updatePurchase, 
  getPurchase, 
  deletePurchase, 
  getPurchases,
  updatePurchaseStatus,
  addPayment
} = require('../validators/purchaseValidator');

// Purchase CRUD routes
router.post('/', 
  auth, 
  createPurchase, 
  PurchaseController.createPurchase
);

router.get('/', auth, getPurchases, PurchaseController.getPurchases);
router.get('/stats', auth, PurchaseController.getPurchaseStats);
router.get('/report', auth, PurchaseController.getPurchaseReport);
router.get('/:id', auth, getPurchase, PurchaseController.getPurchase);

router.put('/:id', 
  auth, 
  updatePurchase, 
  PurchaseController.updatePurchase
);

router.delete('/:id', auth, deletePurchase, PurchaseController.deletePurchase);

// Purchase management routes
router.patch('/:id/status', 
  auth, 
  updatePurchaseStatus, 
  PurchaseController.updatePurchaseStatus
);

router.post('/:id/receive', auth, PurchaseController.markAsReceived);
router.post('/:id/payment', auth, addPayment, PurchaseController.addPayment);

module.exports = router;