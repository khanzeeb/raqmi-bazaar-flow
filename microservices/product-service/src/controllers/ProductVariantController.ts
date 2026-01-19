// Product Variant Controller - Handles HTTP requests for product variants
import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from '../common/BaseController';
import ProductVariantService from '../services/ProductVariantService';
import { CreateVariantInput, UpdateVariantInput } from '../schemas/variantSchemas';

class ProductVariantController extends BaseController {
  async getVariants(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductVariantService.getByProductId(request.params.productId),
      'Product variants fetched successfully',
      'Failed to fetch product variants'
    );
  }

  async getVariant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductVariantService.getById(request.params.id),
      'Product variant fetched successfully',
      'Failed to fetch product variant'
    );
  }

  async createVariant(
    request: FastifyRequest<{ Params: { productId: string }; Body: CreateVariantInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductVariantService.createForProduct(request.params.productId, request.body),
      'Product variant created successfully',
      'Failed to create product variant',
      201
    );
  }

  async updateVariant(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateVariantInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductVariantService.update(request.params.id, request.body),
      'Product variant updated successfully',
      'Failed to update product variant'
    );
  }

  async deleteVariant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    await this.executeDelete(
      request,
      reply,
      () => ProductVariantService.delete(request.params.id),
      'Product variant deleted successfully',
      'Product variant',
      'Failed to delete product variant'
    );
  }
}

export default new ProductVariantController();
