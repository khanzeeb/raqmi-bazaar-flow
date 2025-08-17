import express from 'express';
import { PaymentController } from '../controllers/paymentController';
import { auth } from '../middleware/auth';
import { 
  createPayment, 
  updatePayment, 
  getPayment, 
  deletePayment, 
  getPayments,
  validatePaymentAmount,
  validatePaymentMethodRequirements
} from '../validators/paymentValidator';

const router = express.Router();

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

export default router;