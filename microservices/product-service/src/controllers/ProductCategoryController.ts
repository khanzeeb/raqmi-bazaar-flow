import { Request, Response } from 'express';
import { BaseController } from '../common/BaseController';
import ProductCategoryService from '../services/ProductCategoryService';

class ProductCategoryController extends BaseController {
  async getCategories(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        const filters = this.extractFilters(req);
        return await ProductCategoryService.getAll(filters);
      },
      'Product categories fetched successfully',
      'Failed to fetch product categories'
    );
  }

  async getCategoryTree(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductCategoryService.getTree(),
      'Category tree fetched successfully',
      'Failed to fetch category tree'
    );
  }

  async getCategory(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductCategoryService.getById(req.params.id),
      'Category fetched successfully',
      'Failed to fetch category'
    );
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductCategoryService.create(req.body),
      'Product category created successfully',
      'Failed to create product category',
      201
    );
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductCategoryService.update(req.params.id, req.body),
      'Product category updated successfully',
      'Failed to update product category'
    );
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
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

  private extractFilters(req: Request) {
    return {
      parent_id: req.query.parent_id as string,
      status: req.query.status as 'active' | 'inactive',
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50
    };
  }
}

export default new ProductCategoryController();
