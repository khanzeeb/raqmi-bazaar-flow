import express from 'express';
import SupplierController from '../controllers/supplierController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createSupplierValidator,
  updateSupplierValidator
} from '../validators/supplierValidator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Supplier management routes
router.get('/', SupplierController.getSuppliers);
router.post('/', 
  authorize('admin', 'manager'), 
  createSupplierValidator, 
  SupplierController.createSupplier
);

router.get('/:id', SupplierController.getSupplier);
router.put('/:id', 
  authorize('admin', 'manager'), 
  updateSupplierValidator, 
  SupplierController.updateSupplier
);

router.delete('/:id', 
  authorize('admin', 'manager'), 
  SupplierController.deleteSupplier
);

// Supplier statistics and purchases
router.get('/stats/summary', SupplierController.getSupplierStats);
router.get('/:id/purchases', SupplierController.getSupplierPurchases);

export default router;