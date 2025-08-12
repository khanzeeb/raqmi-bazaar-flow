import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import ExpenseService from '../services/expenseService';

class ExpenseController {
  
  static async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const expense = await ExpenseService.createExpense(req.body);

      res.status(201).json({
        success: true,
        data: expense,
        message: 'Expense created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const expenses = await ExpenseService.getExpenses(req.query);

      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const expense = await ExpenseService.getExpenseById(req.params.id);

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const expense = await ExpenseService.updateExpense(req.params.id, req.body);

      res.json({
        success: true,
        data: expense,
        message: 'Expense updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      await ExpenseService.deleteExpense(req.params.id);

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpenseStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await ExpenseService.getExpenseStats(req.query);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateExpenseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const expense = await ExpenseService.updateExpenseStatus(req.params.id, status);

      res.json({
        success: true,
        data: expense,
        message: 'Expense status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.approveExpense(req.params.id);

      res.json({
        success: true,
        data: expense,
        message: 'Expense approved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async attachReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { receipt_url } = req.body;
      const expense = await ExpenseService.attachReceipt(req.params.id, receipt_url);

      res.json({
        success: true,
        data: expense,
        message: 'Receipt attached successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpensesByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expenses = await ExpenseService.getExpensesByCategory(req.query);

      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpenseReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await ExpenseService.generateExpenseReport(req.query);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ExpenseController;