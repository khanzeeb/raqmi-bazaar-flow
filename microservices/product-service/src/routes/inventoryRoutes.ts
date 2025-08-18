import express from 'express';
import ProductController from '../controllers/ProductController';

const router = express.Router();

// Inventory routes
router.get('/', ProductController.getProducts);
router.get('/low-stock', ProductController.getLowStockProducts);
router.patch('/:id/stock', ProductController.updateStock);

export default router;