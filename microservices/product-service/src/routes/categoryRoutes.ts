// Category Routes - Express router for categories
import { Router } from 'express';
import CategoryController from '../controllers/ProductCategoryController';

const router = Router();

router.get('/tree', CategoryController.getCategoryTree);
router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategory);
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
