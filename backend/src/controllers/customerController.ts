import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import CustomerService from '../services/customerService';

interface AuthenticatedRequest extends Request {
  language?: string;
}

class CustomerController {
  static async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const customer = await CustomerService.createCustomer(req.body);

      res.status(201).json({
        success: true,
        message: req.language === 'ar' ? 'تم إنشاء العميل بنجاح' : 'Customer created successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customers = await CustomerService.getCustomers(req.query);
      
      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const customer = await CustomerService.updateCustomer(req.params.id, req.body);

      res.json({
        success: true,
        message: req.language === 'ar' ? 'تم تحديث العميل بنجاح' : 'Customer updated successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCredit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, type, reason } = req.body;
      const customer = await CustomerService.updateCustomerCredit(req.params.id, amount, type, reason);

      res.json({
        success: true,
        message: req.language === 'ar' ? 'تم تحديث الائتمان بنجاح' : 'Credit updated successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCreditHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await CustomerService.getCustomerCreditHistory(req.params.id, req.query);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerController;