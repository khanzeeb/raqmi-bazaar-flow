import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../common/BaseController';
import CustomerService from '../services/CustomerService';

interface AuthenticatedRequest extends Request {
  language?: string;
}

class CustomerController extends BaseController {
  async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => CustomerService.create(req.body),
      req.language === 'ar' ? 'تم إنشاء العميل بنجاح' : 'Customer created successfully',
      'Failed to create customer',
      201
    );
  }

  async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => CustomerService.getAll(req.query),
      'Customers retrieved successfully',
      'Failed to retrieve customers'
    );
  }

  async getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => CustomerService.getById(req.params.id),
      'Customer retrieved successfully',
      'Failed to retrieve customer'
    );
  }

  async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => CustomerService.update(req.params.id, req.body),
      req.language === 'ar' ? 'تم تحديث العميل بنجاح' : 'Customer updated successfully',
      'Failed to update customer'
    );
  }

  async deleteCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        await CustomerService.delete(req.params.id);
        return { deleted: true };
      },
      req.language === 'ar' ? 'تم حذف العميل بنجاح' : 'Customer deleted successfully',
      'Failed to delete customer'
    );
  }

  async updateCredit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { amount, type, reason } = req.body;
    
    await this.executeOperation(
      req,
      res,
      () => CustomerService.updateCredit(req.params.id, amount, type, reason),
      req.language === 'ar' ? 'تم تحديث الائتمان بنجاح' : 'Credit updated successfully',
      'Failed to update credit'
    );
  }

  async getCreditHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => CustomerService.getCreditHistory(req.params.id, req.query),
      'Credit history retrieved successfully',
      'Failed to retrieve credit history'
    );
  }

  async getCustomerStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => CustomerService.getCustomerStats(req.params.id),
      'Customer statistics retrieved successfully',
      'Failed to retrieve customer statistics'
    );
  }

  async blockCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { reason } = req.body;
    
    await this.executeOperation(
      req,
      res,
      () => CustomerService.blockCustomer(req.params.id, reason),
      req.language === 'ar' ? 'تم حظر العميل بنجاح' : 'Customer blocked successfully',
      'Failed to block customer'
    );
  }

  async unblockCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { reason } = req.body;
    
    await this.executeOperation(
      req,
      res,
      () => CustomerService.unblockCustomer(req.params.id, reason),
      req.language === 'ar' ? 'تم إلغاء حظر العميل بنجاح' : 'Customer unblocked successfully',
      'Failed to unblock customer'
    );
  }
}

export default new CustomerController();