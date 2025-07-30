const db = require('../config/database');

class Product {
  static get tableName() {
    return 'products';
  }

  static async findById(id) {
    const product = await db(this.tableName).where({ id }).first();
    if (product) {
      product.variants = await db('product_variants').where({ product_id: id });
    }
    return product;
  }

  static async findByIds(ids) {
    return await db(this.tableName).whereIn('id', ids);
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName);
    
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('sku', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }
    
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'out-of-stock':
          query = query.where('stock', '<=', 0);
          break;
        case 'low-stock':
          query = query.whereRaw('stock <= min_stock AND stock > 0');
          break;
        case 'in-stock':
          query = query.whereRaw('stock > min_stock');
          break;
      }
    }
    
    if (filters.priceRange) {
      query = query.whereBetween('price', [filters.priceRange.min, filters.priceRange.max]);
    }
    
    const limit = filters.limit || 10;
    const offset = ((filters.page || 1) - 1) * limit;
    
    const products = await query
      .orderBy(filters.sortBy || 'created_at', filters.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await this.count(filters);
    
    return {
      data: products,
      total,
      page: filters.page || 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async count(filters = {}) {
    let query = db(this.tableName).count('* as count');
    
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('sku', 'ilike', `%${filters.search}%`);
      });
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }

  static async create(productData) {
    const trx = await db.transaction();
    
    try {
      const [product] = await trx(this.tableName)
        .insert({
          ...productData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      
      if (productData.variants && productData.variants.length > 0) {
        const variants = productData.variants.map(variant => ({
          ...variant,
          product_id: product.id,
          created_at: new Date()
        }));
        
        await trx('product_variants').insert(variants);
      }
      
      await trx.commit();
      return await this.findById(product.id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id, productData) {
    const trx = await db.transaction();
    
    try {
      const [product] = await trx(this.tableName)
        .where({ id })
        .update({
          ...productData,
          updated_at: new Date()
        })
        .returning('*');
      
      if (productData.variants) {
        await trx('product_variants').where({ product_id: id }).del();
        
        if (productData.variants.length > 0) {
          const variants = productData.variants.map(variant => ({
            ...variant,
            product_id: id,
            created_at: new Date()
          }));
          
          await trx('product_variants').insert(variants);
        }
      }
      
      await trx.commit();
      return await this.findById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id) {
    const trx = await db.transaction();
    
    try {
      await trx('product_variants').where({ product_id: id }).del();
      await trx(this.tableName).where({ id }).del();
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async updateStock(id, newStock, reason = '') {
    const [product] = await db(this.tableName)
      .where({ id })
      .update({
        stock: newStock,
        updated_at: new Date()
      })
      .returning('*');
    
    // Log stock movement
    await db('stock_movements').insert({
      product_id: id,
      type: 'adjustment',
      quantity: newStock,
      reason,
      created_at: new Date()
    });
    
    return product;
  }

  static async getCategories() {
    const result = await db(this.tableName)
      .distinct('category')
      .whereNotNull('category')
      .orderBy('category');
    
    return result.map(row => row.category);
  }

  static async getSuppliers() {
    const result = await db(this.tableName)
      .distinct('supplier')
      .whereNotNull('supplier')
      .orderBy('supplier');
    
    return result.map(row => row.supplier);
  }
}

module.exports = Product;