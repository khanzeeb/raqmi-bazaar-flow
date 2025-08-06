const db = require('../config/database');

class QuotationItem {
  static get tableName() {
    return 'quotation_items';
  }

  static async findById(id) {
    return await db(this.tableName)
      .select(
        'quotation_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .leftJoin('products', 'quotation_items.product_id', 'products.id')
      .where('quotation_items.id', id)
      .first();
  }

  static async findByQuotationId(quotationId) {
    return await db(this.tableName)
      .select(
        'quotation_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .leftJoin('products', 'quotation_items.product_id', 'products.id')
      .where('quotation_items.quotation_id', quotationId)
      .orderBy('quotation_items.id');
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

  static async createBulk(quotationId, items) {
    const trx = await db.transaction();
    
    try {
      // Delete existing items for this quotation
      await trx(this.tableName).where({ quotation_id: quotationId }).del();
      
      // Insert new items
      const itemsData = items.map(item => ({
        ...item,
        quotation_id: quotationId,
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

  static async deleteByQuotationId(quotationId) {
    return await db(this.tableName).where({ quotation_id: quotationId }).del();
  }

  static calculateLineTotal(quantity, unitPrice, discountAmount = 0, taxAmount = 0) {
    const subtotal = quantity * unitPrice;
    return subtotal - discountAmount + taxAmount;
  }

  static async getQuotationItemStats(quotationId) {
    const stats = await db(this.tableName)
      .where({ quotation_id: quotationId })
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

module.exports = QuotationItem;