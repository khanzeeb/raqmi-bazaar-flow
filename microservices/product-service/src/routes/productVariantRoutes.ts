import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import ProductVariantController from '../controllers/ProductVariantController';
import {
  CreateVariantSchema,
  UpdateVariantSchema,
  ProductIdParamSchema,
  IdParamSchema
} from '../schemas/variantSchemas';

export default async function productVariantRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Get variants for a product
  fastify.get('/:productId/variants', {
    schema: {
      params: ProductIdParamSchema
    },
    handler: ProductVariantController.getVariants
  });

  // Get single variant
  fastify.get('/variants/:id', {
    schema: {
      params: IdParamSchema
    },
    handler: ProductVariantController.getVariant
  });

  // Create variant
  fastify.post('/:productId/variants', {
    schema: {
      params: ProductIdParamSchema,
      body: CreateVariantSchema
    },
    handler: ProductVariantController.createVariant
  });

  // Update variant
  fastify.put('/variants/:id', {
    schema: {
      params: IdParamSchema,
      body: UpdateVariantSchema
    },
    handler: ProductVariantController.updateVariant
  });

  // Delete variant
  fastify.delete('/variants/:id', {
    schema: {
      params: IdParamSchema
    },
    handler: ProductVariantController.deleteVariant
  });
}
