import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../common/BaseController';
import SupplierService from '../services/SupplierService';

class SupplierController extends BaseController {
  async createSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => SupplierService.create(req.body),
      'Supplier created successfully',
      'Failed to create supplier',
      201
    );
  }

  async getSuppliers(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => SupplierService.getAll(req.query),
      'Suppliers retrieved successfully',
      'Failed to retrieve suppliers'
    );
  }

  async getSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => SupplierService.getById(req.params.id),
      'Supplier retrieved successfully',
      'Failed to retrieve supplier'
    );
  }

  async updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => SupplierService.update(req.params.id, req.body),
      'Supplier updated successfully',
      'Failed to update supplier'
    );
  }

  async deleteSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        await SupplierService.delete(req.params.id);
        return { deleted: true };
      },
      'Supplier deleted successfully',
      'Failed to delete supplier'
    );
  }

  async getSupplierStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => SupplierService.getSupplierStats(),
      'Supplier statistics retrieved successfully',
      'Failed to retrieve supplier statistics'
    );
  }

  async getSupplierPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => SupplierService.getSupplierPurchases(req.params.id, req.query),
      'Supplier purchases retrieved successfully',
      'Failed to retrieve supplier purchases'
    );
  }
}

export default new SupplierController();