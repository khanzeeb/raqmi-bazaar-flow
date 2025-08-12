import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import SupplierService from '../services/supplierService';

class SupplierController {
  
  static async createSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const supplier = await SupplierService.createSupplier(req.body);

      res.status(201).json({
        success: true,
        data: supplier,
        message: 'Supplier created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSuppliers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const suppliers = await SupplierService.getSuppliers(req.query);

      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const supplier = await SupplierService.getSupplierById(req.params.id);

      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const supplier = await SupplierService.updateSupplier(req.params.id, req.body);

      res.json({
        success: true,
        data: supplier,
        message: 'Supplier updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      await SupplierService.deleteSupplier(req.params.id);

      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSupplierStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await SupplierService.getSupplierStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSupplierPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchases = await SupplierService.getSupplierPurchases(req.params.id, req.query);

      res.json({
        success: true,
        data: purchases
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SupplierController;