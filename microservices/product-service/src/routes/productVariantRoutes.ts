import express from 'express';
import ProductVariantController from '../controllers/ProductVariantController';
import {
  createProductVariantValidator,
  updateProductVariantValidator,
  productVariantIdValidator
} from '../validators/productVariantValidator';
import { productIdValidator } from '../validators/productValidator';

const router = express.Router();

router.get('/:productId/variants', productIdValidator, ProductVariantController.getVariants);
router.get('/variants/:id', productVariantIdValidator, ProductVariantController.getVariant);
router.post('/:productId/variants', [productIdValidator, ...createProductVariantValidator], ProductVariantController.createVariant);
router.put('/variants/:id', updateProductVariantValidator, ProductVariantController.updateVariant);
router.delete('/variants/:id', productVariantIdValidator, ProductVariantController.deleteVariant);

export default router;
