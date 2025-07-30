const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const { auth } = require('../middleware/auth');
const { 
  createCustomer, 
  updateCustomer, 
  getCustomer, 
  getCustomers,
  updateCredit,
  getCreditHistory,
  validateEmailUniqueness,
  validateCreditOperation
} = require('../validators/customerValidator');

// Customer routes
router.post('/', auth, createCustomer, validateEmailUniqueness, CustomerController.createCustomer);
router.get('/', auth, getCustomers, CustomerController.getCustomers);
router.get('/:id', auth, getCustomer, CustomerController.getCustomer);
router.put('/:id', auth, updateCustomer, validateEmailUniqueness, CustomerController.updateCustomer);

// Credit management routes
router.post('/:id/credit', auth, updateCredit, validateCreditOperation, CustomerController.updateCredit);
router.get('/:id/credit-history', auth, getCreditHistory, CustomerController.getCreditHistory);

module.exports = router;