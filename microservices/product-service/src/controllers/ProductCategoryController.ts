import { FastifyRequest, FastifyReply } from 'fastify';
import ProductCategoryService from '../services/ProductCategoryService';
import { CategoryQueryInput, CreateCategoryInput, UpdateCategoryInput } from '../schemas/categorySchemas';

class ProductCategoryController {
  async getCategories(
    request: FastifyRequest<{ Querystring: CategoryQueryInput }>,
    reply: FastifyReply
  ) {
    try {
      const filters = {
        page: request.query.page || 1,
        limit: request.query.limit || 50,
        search: request.query.search,
        parent_id: request.query.parent_id,
        status: request.query.status
      };

      const result = await ProductCategoryService.getAll(filters);
      return reply.send({
        success: true,
        message: 'Product categories fetched successfully',
        data: result
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch product categories'
      });
    }
  }

  async getCategoryTree(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tree = await ProductCategoryService.getTree();
      return reply.send({
        success: true,
        message: 'Category tree fetched successfully',
        data: tree
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch category tree'
      });
    }
  }

  async getCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const category = await ProductCategoryService.getById(request.params.id);
      
      if (!category) {
        return reply.status(404).send({
          success: false,
          message: 'Category not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Category fetched successfully',
        data: category
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch category'
      });
    }
  }

  async createCategory(
    request: FastifyRequest<{ Body: CreateCategoryInput }>,
    reply: FastifyReply
  ) {
    try {
      const category = await ProductCategoryService.create(request.body);
      return reply.status(201).send({
        success: true,
        message: 'Product category created successfully',
        data: category
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        message: error.message || 'Failed to create product category'
      });
    }
  }

  async updateCategory(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCategoryInput }>,
    reply: FastifyReply
  ) {
    try {
      const category = await ProductCategoryService.update(request.params.id, request.body);
      
      if (!category) {
        return reply.status(404).send({
          success: false,
          message: 'Category not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Product category updated successfully',
        data: category
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        success: false,
        message: error.message || 'Failed to update product category'
      });
    }
  }

  async deleteCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const success = await ProductCategoryService.delete(request.params.id);
      
      if (!success) {
        return reply.status(404).send({
          success: false,
          message: 'Category not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Product category deleted successfully',
        data: { deleted: true }
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete product category'
      });
    }
  }
}

export default new ProductCategoryController();
