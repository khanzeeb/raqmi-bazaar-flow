import { Request, Response } from 'express';
import { BaseController } from '../common/BaseController';
import ProductVariantService from '../services/ProductVariantService';

class ProductVariantController extends BaseController {
  async getVariants(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductVariantService.getByProductId(req.params.productId),
      'Product variants fetched successfully',
      'Failed to fetch product variants'
    );
  }

  async getVariant(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductVariantService.getById(req.params.id),
      'Product variant fetched successfully',
      'Failed to fetch product variant'
    );
  }

  async createVariant(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductVariantService.createForProduct(req.params.productId, req.body),
      'Product variant created successfully',
      'Failed to create product variant',
      201
    );
  }

  async updateVariant(req: Request, res: Response): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => await ProductVariantService.update(req.params.id, req.body),
      'Product variant updated successfully',
      'Failed to update product variant'
    );
  }

  async deleteVariant(req: Request, res: Response): Promise<void> {
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
}

export default new ProductVariantController();
