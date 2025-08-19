import express from 'express';
import { SaleController } from '../controllers/SaleController';
import { SaleValidator } from '../validators/saleValidator';

const router = express.Router();
const saleController = new SaleController();

// Sale CRUD routes
router.post('/', 
  SaleValidator.createSale,
  SaleValidator.validateDueDateAfterSaleDate,
  SaleValidator.validateItemsTotal,
  saleController.createSale
);

router.get('/', SaleValidator.getSales, saleController.getSales);
router.get('/stats', saleController.getSaleStats);
router.get('/overdue', saleController.getOverdueSales);
router.get('/:id', SaleValidator.getSale, saleController.getSale);

router.put('/:id', 
  SaleValidator.updateSale,
  SaleValidator.validateDueDateAfterSaleDate,
  SaleValidator.validateItemsTotal,
  saleController.updateSale
);

router.delete('/:id', SaleValidator.deleteSale, saleController.deleteSale);

// Sale management routes
router.post('/:id/cancel', saleController.cancelSale);

export default router;