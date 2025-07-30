const PaymentService = require('../services/paymentService');
const { validationResult } = require('express-validator');

class PaymentController {
  static async createPayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { allocations, ...paymentData } = req.body;
      const payment = await PaymentService.createPayment(paymentData, allocations || []);

      res.status(201).json({
        success: true,
        message: req.language === 'ar' ? 'تم إنشاء الدفعة بنجاح' : 'Payment created successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req, res, next) {
    try {
      const payments = await PaymentService.getPayments(req.query);
      
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPayment(req, res, next) {
    try {
      const payment = await PaymentService.getPaymentById(req.params.id);
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { allocations, ...paymentData } = req.body;
      const payment = await PaymentService.updatePayment(req.params.id, paymentData, allocations);

      res.json({
        success: true,
        message: req.language === 'ar' ? 'تم تحديث الدفعة بنجاح' : 'Payment updated successfully',
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePayment(req, res, next) {
    try {
      await PaymentService.deletePayment(req.params.id);
      
      res.json({
        success: true,
        message: req.language === 'ar' ? 'تم حذف الدفعة بنجاح' : 'Payment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentStats(req, res, next) {
    try {
      const stats = await PaymentService.getPaymentStats(req.query);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;