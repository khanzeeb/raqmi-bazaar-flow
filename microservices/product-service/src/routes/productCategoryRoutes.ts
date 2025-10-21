import express from 'express';
import ProductCategoryController from '../controllers/ProductCategoryController';
import {
  createProductCategoryValidator,
  updateProductCategoryValidator,
  productCategoryIdValidator
} from '../validators/productCategoryValidator';

const router = express.Router();

router.get('/tree', ProductCategoryController.getCategoryTree);
router.get('/', ProductCategoryController.getCategories);
router.get('/:id', productCategoryIdValidator, ProductCategoryController.getCategory);
router.post('/', createProductCategoryValidator, ProductCategoryController.createCategory);
router.put('/:id', updateProductCategoryValidator, ProductCategoryController.updateCategory);
router.delete('/:id', productCategoryIdValidator, ProductCategoryController.deleteCategory);

export default router;
