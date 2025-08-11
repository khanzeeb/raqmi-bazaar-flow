import express from 'express';
import CustomerController from '../controllers/customerController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createCustomerValidator,
  updateCustomerValidator,
  updateCreditValidator
} from '../validators/customerValidator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer management routes
router.get('/', CustomerController.getCustomers);
router.post('/', 
  authorize('admin', 'manager'), 
  createCustomerValidator, 
  CustomerController.createCustomer
);

router.get('/:id', CustomerController.getCustomer);
router.put('/:id', 
  authorize('admin', 'manager'), 
  updateCustomerValidator, 
  CustomerController.updateCustomer
);

router.delete('/:id', 
  authorize('admin', 'manager'), 
  CustomerController.deleteCustomer
);

// Customer credit management
router.put('/:id/credit', 
  authorize('admin', 'manager'), 
  updateCreditValidator, 
  CustomerController.updateCredit
);

router.get('/:id/credit-history', CustomerController.getCreditHistory);

// Customer statistics
router.get('/:id/stats', CustomerController.getCustomerStats);

export default router;