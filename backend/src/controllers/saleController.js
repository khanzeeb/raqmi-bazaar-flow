const SaleService = require('../services/saleService');
const { validationResult } = require('express-validator');

class SaleController {
  static async createSale(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
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

  static async getSales(req, res, next) {
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

  static async getSale(req, res, next) {
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

  static async updateSale(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
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

  static async deleteSale(req, res, next) {
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

  static async getSaleStats(req, res, next) {
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

  static async createSalePayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
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

  static async createPartialPayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
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

  static async createFullPayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
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

  static async allocatePayment(req, res, next) {
    try {
      const { payment_id, allocation_amount } = req.body;
      
      if (!payment_id || !allocation_amount) {
        return res.status(400).json({
          success: false,
          message: 'Payment ID and allocation amount are required'
        });
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

  static async getOverdueSales(req, res, next) {
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

  static async cancelSale(req, res, next) {
    try {
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation reason is required'
        });
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

  static async getSaleReport(req, res, next) {
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

  static async processOverdueReminders(req, res, next) {
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

  static async getSaleReturns(req, res, next) {
    try {
      const { id } = req.params;
      const ReturnService = require('../services/returnService');
      const returns = await ReturnService.getSaleReturns(parseInt(id));
      
      res.json({
        success: true,
        data: returns
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleStateBeforeReturn(req, res, next) {
    try {
      const { id, returnId } = req.params;
      const ReturnService = require('../services/returnService');
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

  static async getSaleStateAfterReturn(req, res, next) {
    try {
      const { id, returnId } = req.params;
      const ReturnService = require('../services/returnService');
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

module.exports = SaleController;