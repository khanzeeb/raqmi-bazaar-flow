const SupplierService = require('../services/supplierService');
const { validationResult } = require('express-validator');

class SupplierController {
  
  static async createSupplier(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const supplier = await SupplierService.createSupplier(req.body);

      res.status(201).json({
        success: true,
        data: supplier,
        message: 'Supplier created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSuppliers(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const suppliers = await SupplierService.getSuppliers(req.query);

      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSupplier(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const supplier = await SupplierService.getSupplierById(req.params.id);

      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSupplier(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const supplier = await SupplierService.updateSupplier(req.params.id, req.body);

      res.json({
        success: true,
        data: supplier,
        message: 'Supplier updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSupplier(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await SupplierService.deleteSupplier(req.params.id);

      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSupplierStats(req, res, next) {
    try {
      const stats = await SupplierService.getSupplierStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSupplierPurchases(req, res, next) {
    try {
      const purchases = await SupplierService.getSupplierPurchases(req.params.id, req.query);

      res.json({
        success: true,
        data: purchases
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SupplierController;