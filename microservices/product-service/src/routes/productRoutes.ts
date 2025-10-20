import express from 'express';
import ProductController from '../controllers/ProductController';
import {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
  productIdValidator
} from '../validators/productValidator';
import {
  createProductCategoryValidator,
  updateProductCategoryValidator,
  productCategoryIdValidator
} from '../validators/productCategoryValidator';
import {
  createProductVariantValidator,
  updateProductVariantValidator,
  productVariantIdValidator
} from '../validators/productVariantValidator';

const router = express.Router();

// Product Category routes
router.get('/categories/tree', ProductController.getCategories);
router.get('/categories', ProductController.getProductCategories);
router.post('/categories', createProductCategoryValidator, ProductController.createProductCategory);
router.put('/categories/:id', updateProductCategoryValidator, ProductController.updateProductCategory);
router.delete('/categories/:id', productCategoryIdValidator, ProductController.deleteProductCategory);

// Low stock and suppliers routes
router.get('/low-stock', ProductController.getLowStockProducts);
router.get('/suppliers', ProductController.getSuppliers);

// Product routes
router.get('/', ProductController.getProducts);
router.get('/:id', productIdValidator, ProductController.getProduct);
router.post('/', createProductValidator, ProductController.createProduct);
router.put('/:id', updateProductValidator, ProductController.updateProduct);
router.delete('/:id', productIdValidator, ProductController.deleteProduct);
router.patch('/:id/stock', updateStockValidator, ProductController.updateStock);

// Product Variant routes
router.get('/:productId/variants', productIdValidator, ProductController.getProductVariants);
router.post('/:productId/variants', [productIdValidator, ...createProductVariantValidator], ProductController.createProductVariant);
router.put('/:productId/variants/:id', [productIdValidator, ...updateProductVariantValidator], ProductController.updateProductVariant);
router.delete('/:productId/variants/:id', [productIdValidator, productVariantIdValidator], ProductController.deleteProductVariant);

export default router;