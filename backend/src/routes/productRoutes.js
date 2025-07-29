const express = require('express');
const ProductController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
  productIdValidator
} = require('../validators/productValidator');

const router = express.Router();

// Public routes
router.get('/', ProductController.getProducts);
router.get('/categories', ProductController.getCategories);
router.get('/suppliers', ProductController.getSuppliers);
router.get('/low-stock', ProductController.getLowStockProducts);
router.get('/:id', productIdValidator, ProductController.getProduct);

// Protected routes
router.use(authenticate);

// Admin/Manager only routes
router.post('/', 
  authorize('admin', 'manager'), 
  createProductValidator, 
  ProductController.createProduct
);

router.put('/:id', 
  authorize('admin', 'manager'), 
  updateProductValidator, 
  ProductController.updateProduct
);

router.delete('/:id', 
  authorize('admin', 'manager'), 
  productIdValidator, 
  ProductController.deleteProduct
);

router.patch('/:id/stock', 
  authorize('admin', 'manager'), 
  updateStockValidator, 
  ProductController.updateStock
);

module.exports = router;