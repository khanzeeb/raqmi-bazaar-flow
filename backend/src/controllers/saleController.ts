import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import SaleService from '../services/saleService';
import ReturnService from '../services/returnService';

interface AuthenticatedRequest extends Request {
  language?: string;
}

class SaleController {
  static async createSale(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

      const { items, ...saleData } = req.body;
      const sale = await SaleService.createSale(saleData, items || []);

      res.status(201).json({
        success: true,
        message: req.language === 'ar' ? 'تم إنشاء المبيعات بنجاح' : 'Sale created successfully',
        data: sale
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sales = await SaleService.getSales(req.query);
      
      res.json({
        success: true,
        data: sales
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sale = await SaleService.getSaleById(req.params.id);
      
      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSale(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

      const { items, ...saleData } = req.body;
      const sale = await SaleService.updateSale(req.params.id, saleData, items);

      res.json({
        success: true,
        message: req.language === 'ar' ? 'تم تحديث المبيعات بنجاح' : 'Sale updated successfully',
        data: sale
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSale(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await SaleService.deleteSale(req.params.id);
      
      res.json({
        success: true,
        message: req.language === 'ar' ? 'تم حذف المبيعات بنجاح' : 'Sale deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await SaleService.getSaleStats(req.query);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSalePayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

      const payment = await SaleService.createSalePayment(req.params.id, req.body);

      res.status(201).json({
        success: true,
        message: req.language === 'ar' ? 'تم إضافة الدفعة بنجاح' : 'Payment added successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPartialPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

      const payment = await SaleService.createPartialPayment(req.params.id, req.body);

      res.status(201).json({
        success: true,
        message: req.language === 'ar' ? 'تم إضافة الدفعة الجزئية بنجاح' : 'Partial payment added successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  static async createFullPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

      const payment = await SaleService.createFullPayment(req.params.id, req.body);

      res.status(201).json({
        success: true,
        message: req.language === 'ar' ? 'تم إضافة الدفعة الكاملة بنجاح' : 'Full payment added successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  static async allocatePayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { payment_id, allocation_amount } = req.body;
      
      if (!payment_id || !allocation_amount) {
        res.status(400).json({
          success: false,
          message: 'Payment ID and allocation amount are required'
        });
        return;
      }

      const allocation = await SaleService.allocateExistingPayment(
        req.params.id, 
        payment_id, 
        allocation_amount
      );

      res.status(201).json({
        success: true,
        message: req.language === 'ar' ? 'تم تخصيص الدفعة بنجاح' : 'Payment allocated successfully',
        data: allocation
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOverdueSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overdueSales = await SaleService.getOverdueSales();
      
      res.json({
        success: true,
        data: overdueSales
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelSale(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      
      if (!reason) {
        res.status(400).json({
          success: false,
          message: 'Cancellation reason is required'
        });
        return;
      }

      const sale = await SaleService.cancelSale(req.params.id, reason);

      res.json({
        success: true,
        message: req.language === 'ar' ? 'تم إلغاء المبيعات بنجاح' : 'Sale cancelled successfully',
        data: sale
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await SaleService.generateSaleReport(req.query);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  static async processOverdueReminders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const processedCount = await SaleService.processOverdueReminders();
      
      res.json({
        success: true,
        message: req.language === 'ar' ? 
          `تم معالجة ${processedCount} تذكير متأخر` : 
          `Processed ${processedCount} overdue reminders`,
        data: { processed_count: processedCount }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleReturns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const returns = await ReturnService.getSaleReturns(parseInt(id));
      
      res.json({
        success: true,
        data: returns
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleStateBeforeReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, returnId } = req.params;
      const saleState = await ReturnService.getSaleStateBeforeReturn(
        parseInt(id), 
        returnId ? parseInt(returnId) : null
      );
      
      res.json({
        success: true,
        data: saleState
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleStateAfterReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, returnId } = req.params;
      const saleState = await ReturnService.getSaleStateAfterReturn(
        parseInt(id), 
        parseInt(returnId)
      );
      
      res.json({
        success: true,
        data: saleState
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SaleController;