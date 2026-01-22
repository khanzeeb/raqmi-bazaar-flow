// Product Controller - Handles HTTP requests for products
import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../common/BaseController';
import ProductService from '../services/ProductService';

class ProductController extends BaseController {
  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeOperation(req, res, next, async () => {
      const { page, limit } = this.getPaginationDefaults(req.query);
      return ProductService.getAll({
        page, limit,
        search: req.query.search as string,
        category: req.query.category as string,
        category_id: req.query.category_id as string,
        status: req.query.status as any,
        stockStatus: req.query.stockStatus as any,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as any,
        supplier: req.query.supplier as string,
        priceRange: req.query.priceMin && req.query.priceMax
          ? { min: parseFloat(req.query.priceMin as string), max: parseFloat(req.query.priceMax as string) }
          : undefined
      });
    }, 'Products fetched successfully');
  };

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeOperation(req, res, next,
      () => ProductService.getById(req.params.id),
      'Product fetched successfully'
    );
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeOperation(req, res, next,
      () => ProductService.create(req.body),
      'Product created successfully', 201
    );
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeOperation(req, res, next,
      () => ProductService.update(req.params.id, req.body),
      'Product updated successfully'
    );
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeDelete(req, res, next,
      () => ProductService.delete(req.params.id),
      'Product deleted successfully'
    );
  };

  updateStock = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeOperation(req, res, next,
      () => ProductService.updateStock(req.params.id, req.body.stock, req.body.reason),
      'Stock updated successfully'
    );
  };

  getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeOperation(req, res, next,
      () => ProductService.getSuppliers(),
      'Suppliers fetched successfully'
    );
  };

  getLowStockProducts = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeOperation(req, res, next,
      () => ProductService.getLowStockProducts(parseInt(req.query.limit as string) || 10),
      'Low stock products fetched successfully'
    );
  };

  getProductStats = async (req: Request, res: Response, next: NextFunction) => {
    await this.executeOperation(req, res, next,
      () => ProductService.getStats(),
      'Product stats fetched successfully'
    );
  };
}

export default new ProductController();
