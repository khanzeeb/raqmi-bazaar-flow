import { Request, Response } from 'express';
import { BaseController } from '../common/BaseController';
import { PurchaseService } from '../services/PurchaseService';
import { validationResult } from 'express-validator';

class PurchaseController extends BaseController {
  private purchaseService: PurchaseService;

  constructor() {
    super();
    this.purchaseService = new PurchaseService();
  }

  getPurchases = this.asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as string,
      payment_status: req.query.payment_status as string,
      supplier_id: req.query.supplier_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort_by: req.query.sort_by as string,
      sort_order: req.query.sort_order as 'asc' | 'desc',
    };

    const purchases = await this.purchaseService.getAll(filters);
    return this.handleSuccess(res, purchases);
  });

  getPurchase = this.asyncHandler(async (req: Request, res: Response) => {
    const purchase = await this.findPurchaseOrFail(req.params.id, res);
    if (!purchase) return;

    return this.handleSuccess(res, purchase);
  });

  createPurchase = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;

    const purchase = await this.purchaseService.create(req.body);
    return this.handleSuccess(res, purchase, 201);
  });

  updatePurchase = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;

    const purchase = await this.purchaseService.update(req.params.id, req.body);
    if (!purchase) {
      return this.handleError(res, { message: 'Purchase not found' }, 404);
    }

    return this.handleSuccess(res, purchase);
  });

  deletePurchase = this.asyncHandler(async (req: Request, res: Response) => {
    const deleted = await this.purchaseService.delete(req.params.id);
    if (!deleted) {
      return this.handleError(res, { message: 'Purchase not found' }, 404);
    }

    return this.handleSuccess(res, { message: 'Purchase deleted successfully' });
  });

  updatePurchaseStatus = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;

    const purchase = await this.purchaseService.updateStatus(req.params.id, req.body.status);
    if (!purchase) {
      return this.handleError(res, { message: 'Purchase not found' }, 404);
    }

    return this.handleSuccess(res, purchase);
  });

  receivePurchase = this.asyncHandler(async (req: Request, res: Response) => {
    const purchase = await this.purchaseService.receivePurchase(req.params.id, req.body.items);
    if (!purchase) {
      return this.handleError(res, { message: 'Purchase not found' }, 404);
    }

    return this.handleSuccess(res, purchase);
  });

  addPayment = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;

    const purchase = await this.purchaseService.addPayment(req.params.id, req.body.amount);
    if (!purchase) {
      return this.handleError(res, { message: 'Purchase not found' }, 404);
    }

    return this.handleSuccess(res, purchase);
  });

  getPurchaseStats = this.asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
    };

    const stats = await this.purchaseService.getStats(filters);
    return this.handleSuccess(res, stats);
  });

  // Helper methods (DRY)
  private validateRequest(req: Request, res: Response): boolean {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      this.handleError(res, { message: 'Validation error', errors: errors.array() }, 400);
      return false;
    }
    return true;
  }

  private async findPurchaseOrFail(id: string, res: Response) {
    const purchase = await this.purchaseService.getById(id);
    if (!purchase) {
      this.handleError(res, { message: 'Purchase not found' }, 404);
      return null;
    }
    return purchase;
  }
}

export default new PurchaseController();
