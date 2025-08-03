const express = require('express');
const router = express.Router();
const ReturnController = require('../controllers/returnController');
const { auth } = require('../middleware/auth');
const { 
  createReturn, 
  updateReturn, 
  getReturn, 
  deleteReturn, 
  getReturns,
  processReturn,
  validateReturnItems
} = require('../validators/returnValidator');

// Return CRUD routes
router.post('/', 
  auth, 
  createReturn,
  validateReturnItems,
  ReturnController.createReturn
);

router.get('/', auth, getReturns, ReturnController.getReturns);
router.get('/stats', auth, ReturnController.getReturnStats);
router.get('/report', auth, ReturnController.getReturnReport);
router.get('/:id', auth, getReturn, ReturnController.getReturn);

router.put('/:id', 
  auth, 
  updateReturn,
  ReturnController.updateReturn
);

router.delete('/:id', auth, deleteReturn, ReturnController.deleteReturn);

// Return processing routes
router.post('/:id/process', 
  auth, 
  processReturn,
  ReturnController.processReturn
);

// Sale-specific return routes
router.get('/sale/:saleId', auth, ReturnController.getSaleReturns);

// Sale state tracking routes
router.get('/sale/:saleId/state/before/:returnId?', auth, ReturnController.getSaleStateBeforeReturn);
router.get('/sale/:saleId/state/after/:returnId', auth, ReturnController.getSaleStateAfterReturn);

module.exports = router;