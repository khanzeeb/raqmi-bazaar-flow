// Variant Routes - Express router for product variants
import { Router } from 'express';
import VariantController from '../controllers/ProductVariantController';

const router = Router();

router.get('/:productId/variants', VariantController.getVariants);
router.get('/variants/:id', VariantController.getVariant);
router.post('/:productId/variants', VariantController.createVariant);
router.put('/variants/:id', VariantController.updateVariant);
router.delete('/variants/:id', VariantController.deleteVariant);

export default router;
