import express from 'express';
import ProductController from '../controllers/ProductController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
  productIdValidator
} from '../validators/productValidator';

const router = express.Router();

// Public routes
router.get('/', ProductController.getProducts);
router.get('/categories', ProductController.getCategories);
router.get('/suppliers', ProductController.getSuppliers);
router.get('/low-stock', ProductController.getLowStockProducts);
router.get('/:id', productIdValidator, ProductController.getProduct);

// Product Category routes
router.get('/categories/list', ProductController.getProductCategories);
router.post('/categories', 
  authenticate,
  authorize('admin', 'manager'),
  ProductController.createProductCategory
);

// Product Variant routes
router.get('/:productId/variants', ProductController.getProductVariants);
router.post('/:productId/variants',
  authenticate,
  authorize('admin', 'manager'),
  ProductController.createProductVariant
);

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

export default router;