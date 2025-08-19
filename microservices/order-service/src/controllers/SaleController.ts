import { Request, Response } from 'express';
import { BaseController } from '../common/BaseController';
import { SaleService } from '../services/SaleService';

export class SaleController extends BaseController {
  private saleService: SaleService;

  constructor() {
    super();
    this.saleService = new SaleService();
  }

  createSale = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => {
        const { items, ...saleData } = req.body;
        return await this.saleService.createSale(saleData, items || []);
      },
      'Sale created successfully',
      'Failed to create sale',
      201
    );
  };

  getSales = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => await this.saleService.getAll(req.query as any),
      'Sales retrieved successfully',
      'Failed to retrieve sales'
    );
  };

  getSale = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => await this.saleService.getById(req.params.id),
      'Sale retrieved successfully',
      'Failed to retrieve sale'
    );
  };

  updateSale = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => {
        const { items, ...saleData } = req.body;
        return await this.saleService.updateSale(req.params.id, saleData, items);
      },
      'Sale updated successfully',
      'Failed to update sale'
    );
  };

  deleteSale = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => await this.saleService.delete(req.params.id),
      'Sale deleted successfully',
      'Failed to delete sale'
    );
  };

  getSaleStats = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => await this.saleService.getSaleStats(req.query as any),
      'Sale stats retrieved successfully',
      'Failed to retrieve sale stats'
    );
  };

  getOverdueSales = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => await this.saleService.getOverdueSales(),
      'Overdue sales retrieved successfully',
      'Failed to retrieve overdue sales'
    );
  };

  cancelSale = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => await this.saleService.cancelSale(req.params.id, req.body.reason),
      'Sale cancelled successfully',
      'Failed to cancel sale'
    );
  };
}