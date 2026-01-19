// Product Controller - Handles HTTP requests for products
import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from '../common/BaseController';
import ProductService from '../services/ProductService';
import { ProductQueryInput, CreateProductInput, UpdateProductInput, UpdateStockInput, IdParam } from '../schemas/productSchemas';

class ProductController extends BaseController {
  async getProducts(
    request: FastifyRequest<{ Querystring: ProductQueryInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      async () => {
        const { page, limit } = this.getPaginationDefaults(request.query);
        return ProductService.getAll({
          page,
          limit,
          search: request.query.search,
          category: request.query.category,
          category_id: request.query.category_id,
          status: request.query.status,
          stockStatus: request.query.stockStatus,
          sortBy: request.query.sortBy,
          sortOrder: request.query.sortOrder,
          supplier: request.query.supplier,
          priceRange: request.query.priceMin && request.query.priceMax 
            ? { min: request.query.priceMin, max: request.query.priceMax } 
            : undefined
        });
      },
      'Products fetched successfully',
      'Failed to fetch products'
    );
  }

  async getProduct(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductService.getById(request.params.id),
      'Product fetched successfully',
      'Failed to fetch product'
    );
  }

  async createProduct(
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductService.create(request.body),
      'Product created successfully',
      'Failed to create product',
      201
    );
  }

  async updateProduct(
    request: FastifyRequest<{ Params: IdParam; Body: UpdateProductInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductService.update(request.params.id, request.body),
      'Product updated successfully',
      'Failed to update product'
    );
  }

  async deleteProduct(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply
  ) {
    await this.executeDelete(
      request,
      reply,
      () => ProductService.delete(request.params.id),
      'Product deleted successfully',
      'Product',
      'Failed to delete product'
    );
  }

  async updateStock(
    request: FastifyRequest<{ Params: IdParam; Body: UpdateStockInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductService.updateStock(
        request.params.id,
        request.body.stock,
        request.body.reason
      ),
      'Stock updated successfully',
      'Failed to update stock'
    );
  }

  async getSuppliers(request: FastifyRequest, reply: FastifyReply) {
    await this.executeOperation(
      request,
      reply,
      () => ProductService.getSuppliers(),
      'Suppliers fetched successfully',
      'Failed to fetch suppliers'
    );
  }

  async getLowStockProducts(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductService.getLowStockProducts(request.query.limit || 10),
      'Low stock products fetched successfully',
      'Failed to fetch low stock products'
    );
  }

  async getProductStats(request: FastifyRequest, reply: FastifyReply) {
    await this.executeOperation(
      request,
      reply,
      () => ProductService.getStats(),
      'Product stats fetched successfully',
      'Failed to fetch product stats'
    );
  }
}

export default new ProductController();
