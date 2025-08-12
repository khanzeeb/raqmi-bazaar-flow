import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import PurchaseService from '../services/purchaseService';

class PurchaseController {
  
  static async createPurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { items, ...purchaseData } = req.body;
      const purchase = await PurchaseService.createPurchase(purchaseData, items);

      res.status(201).json({
        success: true,
        data: purchase,
        message: 'Purchase created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const purchases = await PurchaseService.getPurchases(req.query);

      res.json({
        success: true,
        data: purchases
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const purchase = await PurchaseService.getPurchaseById(req.params.id);

      res.json({
        success: true,
        data: purchase
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { items, ...purchaseData } = req.body;
      const purchase = await PurchaseService.updatePurchase(
        req.params.id, 
        purchaseData, 
        items || null
      );

      res.json({
        success: true,
        data: purchase,
        message: 'Purchase updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      await PurchaseService.deletePurchase(req.params.id);

      res.json({
        success: true,
        message: 'Purchase deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPurchaseStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await PurchaseService.getPurchaseStats(req.query);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePurchaseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const purchase = await PurchaseService.updatePurchaseStatus(req.params.id, status);

      res.json({
        success: true,
        data: purchase,
        message: 'Purchase status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsReceived(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchase = await PurchaseService.markAsReceived(req.params.id, req.body);

      res.json({
        success: true,
        data: purchase,
        message: 'Purchase marked as received successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async addPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const purchase = await PurchaseService.addPayment(req.params.id, req.body);

      res.json({
        success: true,
        data: purchase,
        message: 'Payment added successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPurchaseReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await PurchaseService.generatePurchaseReport(req.query);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PurchaseController;