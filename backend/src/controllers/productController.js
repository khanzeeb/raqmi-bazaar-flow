const Product = require('../models/Product');
const { validationResult } = require('express-validator');

class ProductController {
  static async getProducts(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        category: req.query.category,
        status: req.query.status,
        stockStatus: req.query.stockStatus,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        priceRange: req.query.priceMin && req.query.priceMax ? {
          min: parseFloat(req.query.priceMin),
          max: parseFloat(req.query.priceMax)
        } : undefined
      };

      const result = await Product.findAll(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  }

  static async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product'
      });
    }
  }

  static async createProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }
  }

  static async updateProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const product = await Product.update(id, req.body);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await Product.delete(id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    }
  }

  static async updateStock(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { stock, reason } = req.body;

      const product = await Product.updateStock(id, stock, reason);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update stock'
      });
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await Product.getCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }

  static async getSuppliers(req, res) {
    try {
      const suppliers = await Product.getSuppliers();

      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      console.error('Get suppliers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suppliers'
      });
    }
  }

  static async getLowStockProducts(req, res) {
    try {
      const filters = {
        stockStatus: 'low-stock',
        limit: parseInt(req.query.limit) || 10
      };

      const result = await Product.findAll(filters);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get low stock products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch low stock products'
      });
    }
  }
}

module.exports = ProductController;