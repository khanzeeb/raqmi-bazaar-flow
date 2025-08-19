import express from 'express';
import SupplierController from '../controllers/SupplierController';
import { supplierValidators } from '../validators/supplierValidator';

const router = express.Router();

router.post('/', supplierValidators.create, SupplierController.createSupplier);
router.get('/', SupplierController.getSuppliers);
router.get('/stats', SupplierController.getSupplierStats);
router.get('/:id', SupplierController.getSupplier);
router.put('/:id', supplierValidators.update, SupplierController.updateSupplier);
router.delete('/:id', SupplierController.deleteSupplier);
router.get('/:id/purchases', SupplierController.getSupplierPurchases);

export default router;