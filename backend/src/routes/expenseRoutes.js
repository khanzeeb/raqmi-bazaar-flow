const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const { auth } = require('../middleware/auth');
const { 
  createExpense, 
  updateExpense, 
  getExpense, 
  deleteExpense, 
  getExpenses,
  updateExpenseStatus
} = require('../validators/expenseValidator');

// Expense CRUD routes
router.post('/', 
  auth, 
  createExpense, 
  ExpenseController.createExpense
);

router.get('/', auth, getExpenses, ExpenseController.getExpenses);
router.get('/stats', auth, ExpenseController.getExpenseStats);
router.get('/by-category', auth, ExpenseController.getExpensesByCategory);
router.get('/report', auth, ExpenseController.getExpenseReport);
router.get('/:id', auth, getExpense, ExpenseController.getExpense);

router.put('/:id', 
  auth, 
  updateExpense, 
  ExpenseController.updateExpense
);

router.delete('/:id', auth, deleteExpense, ExpenseController.deleteExpense);

// Expense management routes
router.patch('/:id/status', 
  auth, 
  updateExpenseStatus, 
  ExpenseController.updateExpenseStatus
);

router.post('/:id/approve', auth, ExpenseController.approveExpense);
router.post('/:id/attach-receipt', auth, ExpenseController.attachReceipt);

module.exports = router;