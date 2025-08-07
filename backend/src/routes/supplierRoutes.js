const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplierController');
const { auth } = require('../middleware/auth');
const { 
  createSupplier, 
  updateSupplier, 
  getSupplier, 
  deleteSupplier, 
  getSuppliers
} = require('../validators/supplierValidator');

// Supplier CRUD routes
router.post('/', 
  auth, 
  createSupplier, 
  SupplierController.createSupplier
);

router.get('/', auth, getSuppliers, SupplierController.getSuppliers);
router.get('/stats', auth, SupplierController.getSupplierStats);
router.get('/:id', auth, getSupplier, SupplierController.getSupplier);
router.get('/:id/purchases', auth, SupplierController.getSupplierPurchases);

router.put('/:id', 
  auth, 
  updateSupplier, 
  SupplierController.updateSupplier
);

router.delete('/:id', auth, deleteSupplier, SupplierController.deleteSupplier);

module.exports = router;