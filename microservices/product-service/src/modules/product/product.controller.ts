import { FastifyRequest, FastifyReply } from 'fastify';
import ProductService from '../services/ProductService';
import { ProductQueryInput, CreateProductInput, UpdateProductInput, UpdateStockInput, IdParam } from '../schemas/productSchemas';

class ProductController {
  async getProducts(
    request: FastifyRequest<{ Querystring: ProductQueryInput }>,
    reply: FastifyReply
  ) {
    try {
      const filters = {
        page: request.query.page || 1,
        limit: request.query.limit || 10,
        search: request.query.search,
        category: request.query.category,
        category_id: request.query.category_id,
        status: request.query.status,
        stockStatus: request.query.stockStatus,
        sortBy: request.query.sortBy,
        sortOrder: request.query.sortOrder,
        supplier: request.query.supplier,
        priceRange: request.query.priceMin && request.query.priceMax ? {
          min: request.query.priceMin,
          max: request.query.priceMax
        } : undefined
      };

      const result = await ProductService.getAll(filters);
      return reply.send({
        success: true,
        message: 'Products fetched successfully',
        data: result
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  }

  async getProduct(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply
  ) {
    try {
      const product = await ProductService.getById(request.params.id);
      
      if (!product) {
        return reply.status(404).send({
          success: false,
          message: 'Product not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Product fetched successfully',
        data: product
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch product'
      });
    }
  }

  async createProduct(
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply
  ) {
    try {
      const product = await ProductService.create(request.body);
      return reply.status(201).send({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        message: error.message || 'Failed to create product'
      });
    }
  }

  async updateProduct(
    request: FastifyRequest<{ Params: IdParam; Body: UpdateProductInput }>,
    reply: FastifyReply
  ) {
    try {
      const product = await ProductService.update(request.params.id, request.body);
      
      if (!product) {
        return reply.status(404).send({
          success: false,
          message: 'Product not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        message: error.message || 'Failed to update product'
      });
    }
  }

  async deleteProduct(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply
  ) {
    try {
      const success = await ProductService.delete(request.params.id);
      
      if (!success) {
        return reply.status(404).send({
          success: false,
          message: 'Product not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Product deleted successfully',
        data: { deleted: true }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete product'
      });
    }
  }

  async updateStock(
    request: FastifyRequest<{ Params: IdParam; Body: UpdateStockInput }>,
    reply: FastifyReply
  ) {
    try {
      const { stock, reason } = request.body;
      const product = await ProductService.updateStock(request.params.id, stock, reason);
      
      if (!product) {
        return reply.status(404).send({
          success: false,
          message: 'Product not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Stock updated successfully',
        data: product
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        message: error.message || 'Failed to update stock'
      });
    }
  }

  async getSuppliers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const suppliers = await ProductService.getSuppliers();
      return reply.send({
        success: true,
        message: 'Suppliers fetched successfully',
        data: suppliers
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch suppliers'
      });
    }
  }

  async getLowStockProducts(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const limit = request.query.limit || 10;
      const products = await ProductService.getLowStockProducts(limit);
      return reply.send({
        success: true,
        message: 'Low stock products fetched successfully',
        data: products
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch low stock products'
      });
    }
  }

  async getProductStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await ProductService.getStats();
      return reply.send({
        success: true,
        message: 'Product stats fetched successfully',
        data: stats
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch product stats'
      });
    }
  }
}

export default new ProductController();
