import { Knex } from 'knex';
import db from '../config/database';

interface PurchaseItemData {
  id?: string;
  purchase_id: string;
  product_id: string;
  product_name?: string;
  product_sku?: string;
  product_description?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  line_total: number;
  received_quantity?: number;
  description?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface PurchaseItemStats {
  total_items: number;
  total_quantity: number;
  total_received: number;
  total_amount: number;
}

class PurchaseItem {
  static get tableName(): string {
    return 'purchase_items';
  }

  static async findByPurchaseId(purchaseId: string): Promise<PurchaseItemData[]> {
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

  static async findById(id: string): Promise<PurchaseItemData | undefined> {
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

  static async create(itemData: Omit<PurchaseItemData, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseItemData> {
    const [item] = await db(this.tableName)
      .insert({
        ...itemData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return item;
  }

  static async createBulk(purchaseId: string, items: Omit<PurchaseItemData, 'id' | 'purchase_id' | 'created_at' | 'updated_at'>[]): Promise<PurchaseItemData[]> {
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
      return items as PurchaseItemData[];
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(id: string, itemData: Partial<PurchaseItemData>): Promise<PurchaseItemData> {
    const [item] = await db(this.tableName)
      .where({ id })
      .update({
        ...itemData,
        updated_at: new Date()
      })
      .returning('*');
    
    return item;
  }

  static async delete(id: string): Promise<number> {
    return await db(this.tableName).where({ id }).del();
  }

  static async deleteByPurchaseId(purchaseId: string): Promise<number> {
    return await db(this.tableName).where({ purchase_id: purchaseId }).del();
  }

  static calculateLineTotal(quantity: number, unitPrice: number, discountAmount: number = 0, taxAmount: number = 0): number {
    const subtotal = quantity * unitPrice;
    return subtotal - discountAmount + taxAmount;
  }

  static async updateReceivedQuantity(id: string, receivedQuantity: number): Promise<PurchaseItemData> {
    return await this.update(id, { received_quantity: receivedQuantity });
  }

  static async getPurchaseItemStats(purchaseId: string): Promise<PurchaseItemStats> {
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

export default PurchaseItem;