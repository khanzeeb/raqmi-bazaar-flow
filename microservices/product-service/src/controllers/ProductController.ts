// Product Controller - Single Responsibility: HTTP request handling only

import { FastifyRequest, FastifyReply } from 'fastify';
import ProductService from '../services/ProductService';
import { ValidationError } from '../validators/ProductValidator';
import { 
  ProductQueryInput, 
  CreateProductInput, 
  UpdateProductInput, 
  UpdateStockInput, 
  IdParam 
} from '../schemas/productSchemas';

class ProductController {
  /**
   * Get all products with filters
   */
  async getProducts(
    request: FastifyRequest<{ Querystring: ProductQueryInput }>,
    reply: FastifyReply
  ) {
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
  }

  /**
   * Get single product by ID
   */
  async getProduct(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply
  ) {
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
  }

  /**
   * Create new product
   */
  async createProduct(
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply
  ) {
    const product = await ProductService.create(request.body);
    return reply.status(201).send({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  }

  /**
   * Update existing product
   */
  async updateProduct(
    request: FastifyRequest<{ Params: IdParam; Body: UpdateProductInput }>,
    reply: FastifyReply
  ) {
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
  }

  /**
   * Delete product
   */
  async deleteProduct(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply
  ) {
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
  }

  /**
   * Update product stock
   */
  async updateStock(
    request: FastifyRequest<{ Params: IdParam; Body: UpdateStockInput }>,
    reply: FastifyReply
  ) {
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
  }

  /**
   * Get all suppliers
   */
  async getSuppliers(request: FastifyRequest, reply: FastifyReply) {
    const suppliers = await ProductService.getSuppliers();
    return reply.send({
      success: true,
      message: 'Suppliers fetched successfully',
      data: suppliers
    });
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ) {
    const limit = request.query.limit || 10;
    const products = await ProductService.getLowStockProducts(limit);
    return reply.send({
      success: true,
      message: 'Low stock products fetched successfully',
      data: products
    });
  }

  /**
   * Get product statistics
   */
  async getProductStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await ProductService.getStats();
    return reply.send({
      success: true,
      message: 'Product stats fetched successfully',
      data: stats
    });
  }

  /**
   * Get all categories
   */
  async getCategories(request: FastifyRequest, reply: FastifyReply) {
    const categories = await ProductService.getCategories();
    return reply.send({
      success: true,
      message: 'Categories fetched successfully',
      data: categories
    });
  }
}

export default new ProductController();
