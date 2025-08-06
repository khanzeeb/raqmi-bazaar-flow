const QuotationService = require('../services/quotationService');
const { validationResult } = require('express-validator');

class QuotationController {
  
  static async createQuotation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { items, ...quotationData } = req.body;
      const quotation = await QuotationService.createQuotation(quotationData, items);

      res.status(201).json({
        success: true,
        data: quotation,
        message: 'Quotation created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuotations(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const quotations = await QuotationService.getQuotations(req.query);

      res.json({
        success: true,
        data: quotations
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuotation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const quotation = await QuotationService.getQuotationById(req.params.id);

      res.json({
        success: true,
        data: quotation
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuotation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { items, ...quotationData } = req.body;
      const quotation = await QuotationService.updateQuotation(
        req.params.id, 
        quotationData, 
        items || null
      );

      res.json({
        success: true,
        data: quotation,
        message: 'Quotation updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteQuotation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await QuotationService.deleteQuotation(req.params.id);

      res.json({
        success: true,
        message: 'Quotation deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuotationStats(req, res, next) {
    try {
      const stats = await QuotationService.getQuotationStats(req.query);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendQuotation(req, res, next) {
    try {
      const quotation = await QuotationService.sendQuotation(req.params.id);

      res.json({
        success: true,
        data: quotation,
        message: 'Quotation sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async acceptQuotation(req, res, next) {
    try {
      const quotation = await QuotationService.acceptQuotation(req.params.id);

      res.json({
        success: true,
        data: quotation,
        message: 'Quotation accepted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async declineQuotation(req, res, next) {
    try {
      const { reason } = req.body;
      const quotation = await QuotationService.declineQuotation(req.params.id, reason);

      res.json({
        success: true,
        data: quotation,
        message: 'Quotation declined successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async convertToSale(req, res, next) {
    try {
      const sale = await QuotationService.convertToSale(req.params.id);

      res.json({
        success: true,
        data: sale,
        message: 'Quotation converted to sale successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuotationStatus(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { status } = req.body;
      const quotation = await QuotationService.updateQuotationStatus(req.params.id, status);

      res.json({
        success: true,
        data: quotation,
        message: 'Quotation status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpiredQuotations(req, res, next) {
    try {
      const quotations = await QuotationService.getExpiredQuotations();

      res.json({
        success: true,
        data: quotations
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuotationReport(req, res, next) {
    try {
      const report = await QuotationService.generateQuotationReport(req.query);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  static async processExpiredQuotations(req, res, next) {
    try {
      const count = await QuotationService.processExpiredQuotations();

      res.json({
        success: true,
        data: { processed_count: count },
        message: `Processed ${count} expired quotations`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = QuotationController;