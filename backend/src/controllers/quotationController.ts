import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import QuotationService from '../services/quotationService';

class QuotationController {
  
  static async createQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async getQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const quotations = await QuotationService.getQuotations(req.query);

      res.json({
        success: true,
        data: quotations
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const quotation = await QuotationService.getQuotationById(req.params.id);

      res.json({
        success: true,
        data: quotation
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async deleteQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      await QuotationService.deleteQuotation(req.params.id);

      res.json({
        success: true,
        message: 'Quotation deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuotationStats(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async sendQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async acceptQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async declineQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async convertToSale(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async updateQuotationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async getExpiredQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async getQuotationReport(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async processExpiredQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
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

export default QuotationController;