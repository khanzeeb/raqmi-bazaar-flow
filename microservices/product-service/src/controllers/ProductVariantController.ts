import { FastifyRequest, FastifyReply } from 'fastify';
import ProductVariantService from '../services/ProductVariantService';
import { CreateVariantInput, UpdateVariantInput } from '../schemas/variantSchemas';

class ProductVariantController {
  async getVariants(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const variants = await ProductVariantService.getByProductId(request.params.productId);
      return reply.send({
        success: true,
        message: 'Product variants fetched successfully',
        data: variants
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch product variants'
      });
    }
  }

  async getVariant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const variant = await ProductVariantService.getById(request.params.id);
      
      if (!variant) {
        return reply.status(404).send({
          success: false,
          message: 'Product variant not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Product variant fetched successfully',
        data: variant
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch product variant'
      });
    }
  }

  async createVariant(
    request: FastifyRequest<{ Params: { productId: string }; Body: CreateVariantInput }>,
    reply: FastifyReply
  ) {
    try {
      const variant = await ProductVariantService.createForProduct(request.params.productId, request.body);
      return reply.status(201).send({
        success: true,
        message: 'Product variant created successfully',
        data: variant
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        message: error.message || 'Failed to create product variant'
      });
    }
  }

  async updateVariant(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateVariantInput }>,
    reply: FastifyReply
  ) {
    try {
      const variant = await ProductVariantService.update(request.params.id, request.body);
      
      if (!variant) {
        return reply.status(404).send({
          success: false,
          message: 'Product variant not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Product variant updated successfully',
        data: variant
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        message: error.message || 'Failed to update product variant'
      });
    }
  }

  async deleteVariant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const success = await ProductVariantService.delete(request.params.id);
      
      if (!success) {
        return reply.status(404).send({
          success: false,
          message: 'Product variant not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Product variant deleted successfully',
        data: { deleted: true }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete product variant'
      });
    }
  }
}

export default new ProductVariantController();
