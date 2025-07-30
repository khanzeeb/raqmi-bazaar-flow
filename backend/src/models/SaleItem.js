const db = require('../config/database');

class SaleItem {
  static get tableName() {
    return 'sale_items';
  }

  static async findById(id) {
    return await db(this.tableName)
      .select(
        'sale_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .leftJoin('products', 'sale_items.product_id', 'products.id')
      .where('sale_items.id', id)
      .first();
  }

  static async findBySaleId(saleId) {
    return await db(this.tableName)
      .select(
        'sale_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .leftJoin('products', 'sale_items.product_id', 'products.id')
      .where('sale_items.sale_id', saleId)
      .orderBy('sale_items.id');
  }

  static async create(itemData) {
    const [item] = await db(this.tableName)
      .insert({
        ...itemData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return item;
  }

  static async createBulk(saleId, items) {
    const trx = await db.transaction();
    
    try {
      // Delete existing items for this sale
      await trx(this.tableName).where({ sale_id: saleId }).del();
      
      // Insert new items
      const itemsData = items.map(item => ({
        ...item,
        sale_id: saleId,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const newItems = await trx(this.tableName)
        .insert(itemsData)
        .returning('*');
      
      await trx.commit();
      return newItems;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id, itemData) {
    const [item] = await db(this.tableName)
      .where({ id })
      .update({
        ...itemData,
        updated_at: new Date()
      })
      .returning('*');
    
    return item;
  }

  static async delete(id) {
    return await db(this.tableName).where({ id }).del();
  }

  static async deleteBySaleId(saleId) {
    return await db(this.tableName).where({ sale_id: saleId }).del();
  }

  static calculateLineTotal(quantity, unitPrice, discountAmount = 0, taxAmount = 0) {
    const subtotal = quantity * unitPrice;
    return subtotal - discountAmount + taxAmount;
  }

  static async getSaleItemStats(saleId) {
    const stats = await db(this.tableName)
      .where({ sale_id: saleId })
      .select(
        db.raw('COUNT(*) as total_items'),
        db.raw('SUM(quantity) as total_quantity'),
        db.raw('SUM(line_total) as total_amount'),
        db.raw('SUM(discount_amount) as total_discount'),
        db.raw('SUM(tax_amount) as total_tax')
      )
      .first();
    
    return stats;
  }
}

module.exports = SaleItem;