import express from 'express';
import productRoutes from './productRoutes';
import productCategoryRoutes from './productCategoryRoutes';
import productVariantRoutes from './productVariantRoutes';

const router = express.Router();

// Mount routes
router.use('/products', productRoutes);
router.use('/categories', productCategoryRoutes);
router.use('/products', productVariantRoutes);

export default router;