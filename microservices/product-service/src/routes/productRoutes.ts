import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import ProductController from '../controllers/ProductController';
import {
  CreateProductSchema,
  UpdateProductSchema,
  UpdateStockSchema,
  ProductQuerySchema,
  IdParamSchema
} from '../schemas/productSchemas';

export default async function productRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Get product stats
  fastify.get('/stats', {
    handler: ProductController.getProductStats
  });

  // Get low stock products
  fastify.get('/low-stock', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, default: 10 }
        }
      }
    },
    handler: ProductController.getLowStockProducts
  });

  // Get suppliers
  fastify.get('/suppliers', {
    handler: ProductController.getSuppliers
  });

  // Get all products
  fastify.get('/', {
    schema: {
      querystring: ProductQuerySchema
    },
    handler: ProductController.getProducts
  });

  // Get single product
  fastify.get('/:id', {
    schema: {
      params: IdParamSchema
    },
    handler: ProductController.getProduct
  });

  // Create product
  fastify.post('/', {
    schema: {
      body: CreateProductSchema
    },
    handler: ProductController.createProduct
  });

  // Update product
  fastify.put('/:id', {
    schema: {
      params: IdParamSchema,
      body: UpdateProductSchema
    },
    handler: ProductController.updateProduct
  });

  // Delete product
  fastify.delete('/:id', {
    schema: {
      params: IdParamSchema
    },
    handler: ProductController.deleteProduct
  });

  // Update stock
  fastify.patch('/:id/stock', {
    schema: {
      params: IdParamSchema,
      body: UpdateStockSchema
    },
    handler: ProductController.updateStock
  });
}
