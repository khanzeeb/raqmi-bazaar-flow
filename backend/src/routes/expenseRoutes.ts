import express from 'express';
import ExpenseController from '../controllers/expenseController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createExpenseValidator,
  updateExpenseValidator,
  updateExpenseStatusValidator
} from '../validators/expenseValidator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Expense management routes
router.get('/', ExpenseController.getExpenses);
router.post('/', 
  authorize('admin', 'manager'), 
  createExpenseValidator, 
  ExpenseController.createExpense
);

router.get('/:id', ExpenseController.getExpense);
router.put('/:id', 
  authorize('admin', 'manager'), 
  updateExpenseValidator, 
  ExpenseController.updateExpense
);

router.delete('/:id', 
  authorize('admin', 'manager'), 
  ExpenseController.deleteExpense
);

// Expense status management
router.patch('/:id/status', 
  authorize('admin', 'manager'), 
  updateExpenseStatusValidator, 
  ExpenseController.updateExpenseStatus
);

// Expense approval
router.post('/:id/approve', 
  authorize('admin'), 
  ExpenseController.approveExpense
);

// Receipt management
router.post('/:id/receipt', 
  authorize('admin', 'manager'), 
  ExpenseController.attachReceipt
);

// Expense statistics and reports
router.get('/stats/summary', ExpenseController.getExpenseStats);
router.get('/stats/by-category', ExpenseController.getExpensesByCategory);
router.get('/reports/generate', ExpenseController.generateExpenseReport);

export default router;