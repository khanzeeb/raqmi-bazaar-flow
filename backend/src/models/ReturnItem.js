const db = require('../config/database');

class ReturnItem {
  static get tableName() {
    return 'return_items';
  }

  static async findById(id) {
    return await db(this.tableName)
      .select(
        'return_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .leftJoin('products', 'return_items.product_id', 'products.id')
      .where('return_items.id', id)
      .first();
  }

  static async findByReturnId(returnId) {
    return await db(this.tableName)
      .select(
        'return_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku',
        'sale_items.quantity as original_sale_quantity',
        'sale_items.unit_price as original_unit_price'
      )
      .leftJoin('products', 'return_items.product_id', 'products.id')
      .leftJoin('sale_items', 'return_items.sale_item_id', 'sale_items.id')
      .where('return_items.return_id', returnId)
      .orderBy('return_items.id');
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

  static async createBulk(returnId, items) {
    const trx = await db.transaction();
    
    try {
      // Delete existing items for this return
      await trx(this.tableName).where({ return_id: returnId }).del();
      
      // Insert new items
      const itemsData = items.map(item => ({
        ...item,
        return_id: returnId,
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

  static async deleteByReturnId(returnId) {
    return await db(this.tableName).where({ return_id: returnId }).del();
  }

  static calculateLineTotal(quantity, unitPrice) {
    return quantity * unitPrice;
  }

  static async getReturnItemStats(returnId) {
    const stats = await db(this.tableName)
      .where({ return_id: returnId })
      .select(
        db.raw('COUNT(*) as total_items'),
        db.raw('SUM(quantity_returned) as total_quantity_returned'),
        db.raw('SUM(line_total) as total_amount')
      )
      .first();
    
    return stats;
  }

  static async getSaleItemReturnStats(saleItemId) {
    const stats = await db(this.tableName)
      .where({ sale_item_id: saleItemId })
      .select(
        db.raw('SUM(quantity_returned) as total_quantity_returned'),
        db.raw('COUNT(*) as return_count')
      )
      .first();
    
    return stats;
  }
}

module.exports = ReturnItem;