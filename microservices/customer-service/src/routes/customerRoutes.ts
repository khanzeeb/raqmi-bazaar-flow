import express from 'express';
import CustomerController from '../controllers/CustomerController';
import { customerValidators } from '../validators/customerValidator';

const router = express.Router();

router.post('/', customerValidators.create, CustomerController.createCustomer);
router.get('/', CustomerController.getCustomers);
router.get('/:id', CustomerController.getCustomer);
router.put('/:id', customerValidators.update, CustomerController.updateCustomer);
router.delete('/:id', CustomerController.deleteCustomer);
router.post('/:id/credit', customerValidators.updateCredit, CustomerController.updateCredit);
router.get('/:id/credit-history', CustomerController.getCreditHistory);
router.get('/:id/stats', CustomerController.getCustomerStats);
router.post('/:id/block', customerValidators.block, CustomerController.blockCustomer);
router.post('/:id/unblock', customerValidators.unblock, CustomerController.unblockCustomer);

export default router;