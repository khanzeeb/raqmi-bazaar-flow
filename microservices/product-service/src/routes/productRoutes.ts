import express from 'express';
import ProductController from '../controllers/ProductController';
import {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
  productIdValidator
} from '../validators/productValidator';

const router = express.Router();

// Product stats route
router.get('/stats', ProductController.getProductStats);

// Low stock and suppliers routes
router.get('/low-stock', ProductController.getLowStockProducts);
router.get('/suppliers', ProductController.getSuppliers);

// Product CRUD routes
router.get('/', ProductController.getProducts);
router.get('/:id', productIdValidator, ProductController.getProduct);
router.post('/', createProductValidator, ProductController.createProduct);
router.put('/:id', updateProductValidator, ProductController.updateProduct);
router.delete('/:id', productIdValidator, ProductController.deleteProduct);
router.patch('/:id/stock', updateStockValidator, ProductController.updateStock);

export default router;