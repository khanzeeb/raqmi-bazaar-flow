import { Request, Response } from 'express';
import { BaseController } from '../common/BaseController';
import { ExpenseService } from '../services/ExpenseService';

export class ExpenseController extends BaseController {
  private expenseService: ExpenseService;

  constructor() {
    super();
    this.expenseService = new ExpenseService();
  }

  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    const expenses = await this.expenseService.getAll(req.query);
    this.handleSuccess(res, expenses);
  });

  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const expense = await this.expenseService.getById(req.params.id);
    if (!expense) {
      return this.handleError(res, new Error('Expense not found'), 404);
    }
    this.handleSuccess(res, expense);
  });

  create = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    
    const expense = await this.expenseService.create(req.body);
    this.handleSuccess(res, expense, 201);
  });

  update = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    
    const expense = await this.expenseService.update(req.params.id, req.body);
    if (!expense) {
      return this.handleError(res, new Error('Expense not found'), 404);
    }
    this.handleSuccess(res, expense);
  });

  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const deleted = await this.expenseService.delete(req.params.id);
    if (!deleted) {
      return this.handleError(res, new Error('Expense not found'), 404);
    }
    this.handleSuccess(res, { message: 'Expense deleted successfully' });
  });

  updateStatus = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    
    const { status } = req.body;
    const expense = await this.expenseService.updateStatus(req.params.id, status);
    this.handleSuccess(res, expense);
  });

  approve = this.asyncHandler(async (req: Request, res: Response) => {
    const expense = await this.expenseService.approve(req.params.id);
    this.handleSuccess(res, expense);
  });

  attachReceipt = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    
    const { receipt_url } = req.body;
    const expense = await this.expenseService.attachReceipt(req.params.id, receipt_url);
    this.handleSuccess(res, expense);
  });

  getStats = this.asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.expenseService.getStats(req.query);
    this.handleSuccess(res, stats);
  });

  getByCategory = this.asyncHandler(async (req: Request, res: Response) => {
    const categoryData = await this.expenseService.getByCategory(req.query);
    this.handleSuccess(res, categoryData);
  });
}
