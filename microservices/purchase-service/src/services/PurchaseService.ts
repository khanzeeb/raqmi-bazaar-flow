import { BaseService } from '../common/BaseService';
import { PurchaseData, PurchaseFilter } from '../models/Purchase';
import { PurchaseItemData } from '../models/PurchaseItem';
import { PurchaseRepository } from '../repositories/PurchaseRepository';
import { PurchaseItemRepository } from '../repositories/PurchaseItemRepository';
import { PurchaseMapper } from '../mappers/PurchaseMapper';
import { PurchaseItemMapper } from '../mappers/PurchaseItemMapper';
import db from '../config/database';

export class PurchaseService extends BaseService<PurchaseData> {
  private purchaseRepository: PurchaseRepository;
  private purchaseItemRepository: PurchaseItemRepository;

  constructor() {
    const purchaseRepository = new PurchaseRepository();
    super(purchaseRepository);
    this.purchaseRepository = purchaseRepository;
    this.purchaseItemRepository = new PurchaseItemRepository();
  }

  async getAll(filters?: PurchaseFilter) {
    const purchases = await this.purchaseRepository.findAll(filters);
    return PurchaseMapper.toDTOList(purchases);
  }

  async getById(id: string) {
    const purchase = await this.purchaseRepository.findById(id);
    if (!purchase) return undefined;

    const items = await this.purchaseItemRepository.findByPurchaseId(id);
    const itemDTOs = PurchaseItemMapper.toDTOList(items);
    
    return PurchaseMapper.toDTO(purchase, itemDTOs);
  }

  async create(data: any) {
    const trx = await db.transaction();

    try {
      const purchaseNumber = await this.purchaseRepository.generatePurchaseNumber();
      
      const purchaseData: Partial<PurchaseData> = {
        purchase_number: purchaseNumber,
        supplier_id: data.supplier_id,
        purchase_date: new Date(data.purchase_date),
        expected_delivery_date: data.expected_delivery_date ? new Date(data.expected_delivery_date) : undefined,
        subtotal: data.subtotal,
        tax_amount: data.tax_amount,
        discount_amount: data.discount_amount,
        total_amount: data.total_amount,
        paid_amount: data.paid_amount || 0,
        currency: data.currency || 'USD',
        status: data.status || 'pending',
        payment_status: data.payment_status || 'pending',
        notes: data.notes,
        terms_conditions: data.terms_conditions,
      };

      const [purchase] = await trx('purchases').insert(purchaseData).returning('*');

      if (data.items && data.items.length > 0) {
        const items = data.items.map((item: any) => ({
          purchase_id: purchase.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          tax_amount: item.tax_amount || 0,
          line_total: item.line_total,
          received_quantity: 0,
        }));

        await trx('purchase_items').insert(items);
      }

      await trx.commit();

      return this.getById(purchase.id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(id: string, data: any) {
    const trx = await db.transaction();

    try {
      const updateData: Partial<PurchaseData> = {
        supplier_id: data.supplier_id,
        purchase_date: data.purchase_date ? new Date(data.purchase_date) : undefined,
        expected_delivery_date: data.expected_delivery_date ? new Date(data.expected_delivery_date) : undefined,
        subtotal: data.subtotal,
        tax_amount: data.tax_amount,
        discount_amount: data.discount_amount,
        total_amount: data.total_amount,
        status: data.status,
        payment_status: data.payment_status,
        notes: data.notes,
        terms_conditions: data.terms_conditions,
      };

      await trx('purchases').where({ id }).update(updateData);

      if (data.items) {
        await trx('purchase_items').where({ purchase_id: id }).del();
        
        if (data.items.length > 0) {
          const items = data.items.map((item: any) => ({
            purchase_id: id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount || 0,
            tax_amount: item.tax_amount || 0,
            line_total: item.line_total,
            received_quantity: item.received_quantity || 0,
          }));

          await trx('purchase_items').insert(items);
        }
      }

      await trx.commit();

      return this.getById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async updateStatus(id: string, status: PurchaseData['status']) {
    const updateData: Partial<PurchaseData> = { status };
    
    if (status === 'received') {
      updateData.received_date = new Date();
    }

    await this.purchaseRepository.update(id, updateData);
    return this.getById(id);
  }

  async receivePurchase(id: string, receivedItems?: any[]) {
    const trx = await db.transaction();

    try {
      if (receivedItems && receivedItems.length > 0) {
        for (const item of receivedItems) {
          await trx('purchase_items')
            .where({ id: item.item_id })
            .update({ received_quantity: item.received_quantity });
        }
      } else {
        const items = await trx('purchase_items').where({ purchase_id: id });
        for (const item of items) {
          await trx('purchase_items')
            .where({ id: item.id })
            .update({ received_quantity: item.quantity });
        }
      }

      await trx('purchases')
        .where({ id })
        .update({
          status: 'received',
          received_date: new Date(),
        });

      await trx.commit();

      return this.getById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async addPayment(id: string, amount: number) {
    const purchase = await this.purchaseRepository.findById(id);
    if (!purchase) throw new Error('Purchase not found');

    const newPaidAmount = Number(purchase.paid_amount) + Number(amount);
    const paymentStatus = 
      newPaidAmount >= Number(purchase.total_amount) ? 'paid' : 
      newPaidAmount > 0 ? 'partial' : 'pending';

    await this.purchaseRepository.update(id, {
      paid_amount: newPaidAmount,
      payment_status: paymentStatus,
    });

    return this.getById(id);
  }

  async getStats(filters?: { start_date?: string; end_date?: string }) {
    return this.purchaseRepository.getStats(filters);
  }

  async delete(id: string): Promise<boolean> {
    const trx = await db.transaction();

    try {
      await trx('purchase_items').where({ purchase_id: id }).del();
      await trx('purchases').where({ id }).del();
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
