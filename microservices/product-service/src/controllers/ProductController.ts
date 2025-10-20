import { Request, Response } from 'express';
import { BaseController } from '../common/BaseController';
import ProductService from '../services/ProductService';
import ProductCategoryService from '../services/ProductCategoryService';
import ProductVariantService from '../services/ProductVariantService';

class ProductController extends BaseController {
  async getProducts(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        const filters = this.extractProductFilters(req);
        return await ProductService.getAll(filters);
      },
      'Products fetched successfully',
      'Failed to fetch products'
    );
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductService.getById(req.params.id),
      'Product fetched successfully',
      'Failed to fetch product'
    );
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductService.create(req.body),
      'Product created successfully',
      'Failed to create product',
      201
    );
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductService.update(req.params.id, req.body),
      'Product updated successfully',
      'Failed to update product'
    );
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        const success = await ProductService.delete(req.params.id);
        return success ? { deleted: true } : null;
      },
      'Product deleted successfully',
      'Failed to delete product'
    );
  }

  async updateStock(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        const { stock, reason } = req.body;
        return await ProductService.updateStock(req.params.id, stock, reason);
      },
      'Stock updated successfully',
      'Failed to update stock'
    );
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductCategoryService.getTree(),
      'Categories fetched successfully',
      'Failed to fetch categories'
    );
  }

  async getSuppliers(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductService.getSuppliers(),
      'Suppliers fetched successfully',
      'Failed to fetch suppliers'
    );
  }

  async getLowStockProducts(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        const limit = parseInt(req.query.limit as string) || 10;
        return await ProductService.getLowStockProducts(limit);
      },
      'Low stock products fetched successfully',
      'Failed to fetch low stock products'
    );
  }

  async getProductCategories(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        const filters = this.extractCategoryFilters(req);
        return await ProductCategoryService.getAll(filters);
      },
      'Product categories fetched successfully',
      'Failed to fetch product categories'
    );
  }

  async createProductCategory(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductCategoryService.create(req.body),
      'Product category created successfully',
      'Failed to create product category',
      201
    );
  }

  async getProductVariants(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductVariantService.getByProductId(req.params.productId),
      'Product variants fetched successfully',
      'Failed to fetch product variants'
    );
  }

  async createProductVariant(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductVariantService.createForProduct(req.params.productId, req.body),
      'Product variant created successfully',
      'Failed to create product variant',
      201
    );
  }

  async updateProductCategory(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductCategoryService.update(req.params.id, req.body),
      'Product category updated successfully',
      'Failed to update product category'
    );
  }

  async deleteProductCategory(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        const success = await ProductCategoryService.delete(req.params.id);
        return success ? { deleted: true } : null;
      },
      'Product category deleted successfully',
      'Failed to delete product category'
    );
  }

  async updateProductVariant(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductVariantService.update(req.params.id, req.body),
      'Product variant updated successfully',
      'Failed to update product variant'
    );
  }

  async deleteProductVariant(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        const success = await ProductVariantService.delete(req.params.id);
        return success ? { deleted: true } : null;
      },
      'Product variant deleted successfully',
      'Failed to delete product variant'
    );
  }

  private extractProductFilters(req: Request) {
    return {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      category: req.query.category as string,
      category_id: req.query.category_id as string,
      status: req.query.status as 'active' | 'inactive' | 'discontinued',
      stockStatus: req.query.stockStatus as 'in-stock' | 'low-stock' | 'out-of-stock',
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      supplier: req.query.supplier as string,
      priceRange: req.query.priceMin && req.query.priceMax ? {
        min: parseFloat(req.query.priceMin as string),
        max: parseFloat(req.query.priceMax as string)
      } : undefined
    };
  }

  private extractCategoryFilters(req: Request) {
    return {
      parent_id: req.query.parent_id as string,
      status: req.query.status as 'active' | 'inactive',
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50
    };
  }
}

export default new ProductController();