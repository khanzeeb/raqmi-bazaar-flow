const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');
const { 
  createPayment, 
  updatePayment, 
  getPayment, 
  deletePayment, 
  getPayments,
  validatePaymentAmount,
  validatePaymentMethodRequirements
} = require('../validators/paymentValidator');

// Payment routes
router.post('/', 
  auth, 
  createPayment, 
  validatePaymentAmount,
  validatePaymentMethodRequirements,
  PaymentController.createPayment
);

router.get('/', auth, getPayments, PaymentController.getPayments);
router.get('/stats', auth, PaymentController.getPaymentStats);
router.get('/:id', auth, getPayment, PaymentController.getPayment);

router.put('/:id', 
  auth, 
  updatePayment, 
  validatePaymentAmount,
  validatePaymentMethodRequirements,
  PaymentController.updatePayment
);

router.delete('/:id', auth, deletePayment, PaymentController.deletePayment);

module.exports = router;