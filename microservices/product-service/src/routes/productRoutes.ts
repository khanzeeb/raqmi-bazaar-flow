import express from 'express';
import ProductController from '../controllers/ProductController';
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
router.post('/categories', ProductController.createProductCategory);

// Product Variant routes
router.get('/:productId/variants', ProductController.getProductVariants);
router.post('/:productId/variants', ProductController.createProductVariant);

// CRUD routes
router.post('/', createProductValidator, ProductController.createProduct);
router.put('/:id', updateProductValidator, ProductController.updateProduct);
router.delete('/:id', productIdValidator, ProductController.deleteProduct);
router.patch('/:id/stock', updateStockValidator, ProductController.updateStock);

export default router;