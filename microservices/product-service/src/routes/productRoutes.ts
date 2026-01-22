// Product Routes - Express router for products
import { Router } from 'express';
import ProductController from '../controllers/ProductController';

const router = Router();

router.get('/stats', ProductController.getProductStats);
router.get('/low-stock', ProductController.getLowStockProducts);
router.get('/suppliers', ProductController.getSuppliers);
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProduct);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.patch('/:id/stock', ProductController.updateStock);

export default router;
