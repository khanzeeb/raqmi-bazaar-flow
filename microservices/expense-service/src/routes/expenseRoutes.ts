import { Router } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { ExpenseValidator } from '../validators/expenseValidator';

const router = Router();
const controller = new ExpenseController();
const validator = new ExpenseValidator();

// Stats routes (must be before :id routes)
router.get('/stats/summary', controller.getStats);
router.get('/stats/by-category', controller.getByCategory);

// CRUD routes
router.route('/')
  .get(controller.getAll)
  .post(validator.create(), controller.create);

router.route('/:id')
  .get(controller.getById)
  .put(validator.update(), controller.update)
  .delete(controller.delete);

// Status management
router.patch('/:id/status', validator.updateStatus(), controller.updateStatus);

// Actions
router.post('/:id/approve', controller.approve);
router.post('/:id/receipt', validator.attachReceipt(), controller.attachReceipt);

export default router;
