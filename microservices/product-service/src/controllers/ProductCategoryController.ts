// Product Category Controller - Handles HTTP requests for categories
import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from '../common/BaseController';
import ProductCategoryService from '../services/ProductCategoryService';
import { CategoryQueryInput, CreateCategoryInput, UpdateCategoryInput } from '../schemas/categorySchemas';

class ProductCategoryController extends BaseController {
  async getCategories(
    request: FastifyRequest<{ Querystring: CategoryQueryInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      async () => {
        return ProductCategoryService.getAll({
          page: request.query.page || 1,
          limit: request.query.limit || 50,
          search: request.query.search,
          parent_id: request.query.parent_id,
          status: request.query.status
        });
      },
      'Product categories fetched successfully',
      'Failed to fetch product categories'
    );
  }

  async getCategoryTree(request: FastifyRequest, reply: FastifyReply) {
    await this.executeOperation(
      request,
      reply,
      () => ProductCategoryService.getTree(),
      'Category tree fetched successfully',
      'Failed to fetch category tree'
    );
  }

  async getCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductCategoryService.getById(request.params.id),
      'Category fetched successfully',
      'Failed to fetch category'
    );
  }

  async createCategory(
    request: FastifyRequest<{ Body: CreateCategoryInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductCategoryService.create(request.body),
      'Product category created successfully',
      'Failed to create product category',
      201
    );
  }

  async updateCategory(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCategoryInput }>,
    reply: FastifyReply
  ) {
    await this.executeOperation(
      request,
      reply,
      () => ProductCategoryService.update(request.params.id, request.body),
      'Product category updated successfully',
      'Failed to update product category'
    );
  }

  async deleteCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    await this.executeDelete(
      request,
      reply,
      () => ProductCategoryService.delete(request.params.id),
      'Product category deleted successfully',
      'Category',
      'Failed to delete product category'
    );
  }
}

export default new ProductCategoryController();
