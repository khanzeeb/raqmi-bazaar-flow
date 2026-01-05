import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../common/BaseController';
import { QuotationService } from './quotation.service';

export class QuotationController extends BaseController {
  private static quotationService = new QuotationService();

  static async createQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, ...quotationData } = req.body;
      const quotation = await QuotationController.quotationService.createQuotation(quotationData, items || []);

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
      const quotations = await QuotationController.quotationService.getAll(req.query);

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
      const quotation = await QuotationController.quotationService.getById(req.params.id);

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

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
      const { items, ...quotationData } = req.body;
      const quotation = await QuotationController.quotationService.updateQuotation(
        req.params.id,
        quotationData,
        items || undefined
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
      const deleted = await QuotationController.quotationService.delete(req.params.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

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
      const stats = await QuotationController.quotationService.getQuotationStats(req.query);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpiredQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotations = await QuotationController.quotationService.getExpiredQuotations();

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
      const report = await QuotationController.quotationService.generateQuotationReport(req.query);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotation = await QuotationController.quotationService.sendQuotation(req.params.id);

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
      const quotation = await QuotationController.quotationService.acceptQuotation(req.params.id);

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
      const quotation = await QuotationController.quotationService.declineQuotation(req.params.id, reason);

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
      const result = await QuotationController.quotationService.convertToSale(req.params.id);

      res.json({
        success: true,
        data: result,
        message: 'Quotation converted to sale successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuotationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const quotation = await QuotationController.quotationService.updateQuotationStatus(req.params.id, status);

      res.json({
        success: true,
        data: quotation,
        message: 'Quotation status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async processExpiredQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const processedCount = await QuotationController.quotationService.processExpiredQuotations();

      res.json({
        success: true,
        data: { processed_count: processedCount },
        message: `${processedCount} expired quotations processed successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateQuotationNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotationNumber = await QuotationController.quotationService.generateQuotationNumber();

      res.json({
        success: true,
        data: { quotationNumber }
      });
    } catch (error) {
      next(error);
    }
  }
}
