import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Product from '../models/Product';
import ProductCategory from '../models/ProductCategory';
import ProductVariant from '../models/ProductVariant';

class ProductController {
  static async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        category: req.query.category as string,
        category_id: req.query.category_id as string,
        status: req.query.status as 'active' | 'inactive' | 'discontinued',
        stockStatus: req.query.stockStatus as 'in-stock' | 'low-stock' | 'out-of-stock',
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        supplier: req.query.supplier as string,
        priceRange: req.query.priceMin && req.query.priceMax ? {
          min: parseFloat(req.query.priceMin as string),
          max: parseFloat(req.query.priceMax as string)
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

  static async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
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

  static async createProduct(req: Request, res: Response): Promise<void> {
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

  static async updateProduct(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const product = await Product.update(id, req.body);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
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

  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
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

  static async updateStock(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const { stock, reason } = req.body;

      const product = await Product.updateStock(id, stock, reason);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
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

  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await ProductCategory.getTree();

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

  static async getSuppliers(req: Request, res: Response): Promise<void> {
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

  static async getLowStockProducts(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        stockStatus: 'low-stock' as const,
        limit: parseInt(req.query.limit as string) || 10
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

  // Product Category methods
  static async getProductCategories(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        parent_id: req.query.parent_id as string,
        status: req.query.status as 'active' | 'inactive',
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50
      };

      const result = await ProductCategory.findAll(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get product categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product categories'
      });
    }
  }

  static async createProductCategory(req: Request, res: Response): Promise<void> {
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

      const category = await ProductCategory.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Product category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create product category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product category'
      });
    }
  }

  // Product Variant methods
  static async getProductVariants(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const variants = await ProductVariant.findByProductId(productId);

      res.json({
        success: true,
        data: variants
      });
    } catch (error) {
      console.error('Get product variants error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product variants'
      });
    }
  }

  static async createProductVariant(req: Request, res: Response): Promise<void> {
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

      const { productId } = req.params;
      const variantData = { ...req.body, product_id: productId };
      const variant = await ProductVariant.create(variantData);

      res.status(201).json({
        success: true,
        message: 'Product variant created successfully',
        data: variant
      });
    } catch (error) {
      console.error('Create product variant error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product variant'
      });
    }
  }
}

export default ProductController;