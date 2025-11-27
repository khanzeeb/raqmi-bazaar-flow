import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import ProductCategoryController from '../controllers/ProductCategoryController';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryQuerySchema,
  IdParamSchema
} from '../schemas/categorySchemas';

export default async function productCategoryRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Get category tree
  fastify.get('/tree', {
    handler: ProductCategoryController.getCategoryTree
  });

  // Get all categories
  fastify.get('/', {
    schema: {
      querystring: CategoryQuerySchema
    },
    handler: ProductCategoryController.getCategories
  });

  // Get single category
  fastify.get('/:id', {
    schema: {
      params: IdParamSchema
    },
    handler: ProductCategoryController.getCategory
  });

  // Create category
  fastify.post('/', {
    schema: {
      body: CreateCategorySchema
    },
    handler: ProductCategoryController.createCategory
  });

  // Update category
  fastify.put('/:id', {
    schema: {
      params: IdParamSchema,
      body: UpdateCategorySchema
    },
    handler: ProductCategoryController.updateCategory
  });

  // Delete category
  fastify.delete('/:id', {
    schema: {
      params: IdParamSchema
    },
    handler: ProductCategoryController.deleteCategory
  });
}
