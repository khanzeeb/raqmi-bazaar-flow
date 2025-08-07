const db = require('../config/database');

class PurchaseItem {
  static get tableName() {
    return 'purchase_items';
  }

  static async findByPurchaseId(purchaseId) {
    return await db(this.tableName)
      .select(
        'purchase_items.*',
        'products.name as product_name',
        'products.sku as product_sku',
        'products.description as product_description'
      )
      .leftJoin('products', 'purchase_items.product_id', 'products.id')
      .where('purchase_items.purchase_id', purchaseId)
      .orderBy('purchase_items.created_at', 'asc');
  }

  static async findById(id) {
    return await db(this.tableName)
      .select(
        'purchase_items.*',
        'products.name as product_name',
        'products.sku as product_sku'
      )
      .leftJoin('products', 'purchase_items.product_id', 'products.id')
      .where('purchase_items.id', id)
      .first();
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

  static async createBulk(purchaseId, items) {
    const trx = await db.transaction();
    
    try {
      // Delete existing items
      await trx(this.tableName).where({ purchase_id: purchaseId }).del();
      
      // Insert new items
      if (items.length > 0) {
        const itemsWithTimestamps = items.map(item => ({
          ...item,
          purchase_id: purchaseId,
          created_at: new Date(),
          updated_at: new Date()
        }));
        
        await trx(this.tableName).insert(itemsWithTimestamps);
      }
      
      await trx.commit();
      return items;
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

  static async deleteByPurchaseId(purchaseId) {
    return await db(this.tableName).where({ purchase_id: purchaseId }).del();
  }

  static calculateLineTotal(quantity, unitPrice, discountAmount = 0, taxAmount = 0) {
    const subtotal = quantity * unitPrice;
    return subtotal - discountAmount + taxAmount;
  }

  static async updateReceivedQuantity(id, receivedQuantity) {
    return await this.update(id, { received_quantity: receivedQuantity });
  }

  static async getPurchaseItemStats(purchaseId) {
    const stats = await db(this.tableName)
      .where('purchase_id', purchaseId)
      .select(
        db.raw('COUNT(*) as total_items'),
        db.raw('SUM(quantity) as total_quantity'),
        db.raw('SUM(received_quantity) as total_received'),
        db.raw('SUM(line_total) as total_amount')
      )
      .first();
    
    return stats;
  }
}

module.exports = PurchaseItem;