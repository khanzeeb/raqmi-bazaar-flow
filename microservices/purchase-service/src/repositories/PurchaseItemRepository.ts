import { BaseRepository } from '../common/BaseRepository';
import { PurchaseItemData } from '../models/PurchaseItem';

export class PurchaseItemRepository extends BaseRepository<PurchaseItemData> {
  constructor() {
    super('purchase_items');
  }

  async findByPurchaseId(purchaseId: string): Promise<PurchaseItemData[]> {
    return this.db(this.tableName).where({ purchase_id: purchaseId });
  }

  async deleteByPurchaseId(purchaseId: string): Promise<boolean> {
    const deleted = await this.db(this.tableName).where({ purchase_id: purchaseId }).del();
    return deleted > 0;
  }

  async bulkCreate(items: Partial<PurchaseItemData>[]): Promise<PurchaseItemData[]> {
    return this.db(this.tableName).insert(items).returning('*');
  }

  async updateReceivedQuantity(id: string, quantity: number): Promise<PurchaseItemData | undefined> {
    const [result] = await this.db(this.tableName)
      .where({ id })
      .update({ received_quantity: quantity })
      .returning('*');
    return result;
  }
}
