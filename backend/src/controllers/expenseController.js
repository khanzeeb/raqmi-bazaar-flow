const ExpenseService = require('../services/expenseService');
const { validationResult } = require('express-validator');

class ExpenseController {
  
  static async createExpense(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
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

  static async getExpenses(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
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

  static async getExpense(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
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

  static async updateExpense(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
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

  static async deleteExpense(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
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

  static async getExpenseStats(req, res, next) {
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

  static async updateExpenseStatus(req, res, next) {
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

  static async approveExpense(req, res, next) {
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

  static async attachReceipt(req, res, next) {
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

  static async getExpensesByCategory(req, res, next) {
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

  static async getExpenseReport(req, res, next) {
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

module.exports = ExpenseController;