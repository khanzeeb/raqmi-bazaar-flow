import { BaseService } from '../common/BaseService';
import { PurchaseData, PurchaseFilter } from '../models/Purchase';
import { PurchaseItemData } from '../models/PurchaseItem';
import { PurchaseRepository } from '../repositories/PurchaseRepository';
import { PurchaseItemRepository } from '../repositories/PurchaseItemRepository';
import { PurchaseMapper } from '../mappers/PurchaseMapper';
import { PurchaseItemMapper } from '../mappers/PurchaseItemMapper';

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

  private preparePurchaseData(data: any): Partial<PurchaseData> {
    return {
      purchase_number: data.purchase_number,
      supplier_id: data.supplier_id,
      purchase_date: data.purchase_date ? new Date(data.purchase_date) : new Date(),
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
  }

  private prepareItemsData(items: any[], purchaseId?: string): Partial<PurchaseItemData>[] {
    return items.map(item => ({
      purchase_id: purchaseId,
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
  }

  async create(data: any) {
    const purchaseNumber = await this.purchaseRepository.generatePurchaseNumber();
    const purchaseData = this.preparePurchaseData({ ...data, purchase_number: purchaseNumber });
    const items = data.items ? this.prepareItemsData(data.items) : [];

    const purchase = await this.purchaseRepository.createWithItems(purchaseData, items);
    return this.getById(purchase.id);
  }

  async update(id: string, data: any) {
    const updateData = this.preparePurchaseData(data);
    const items = data.items ? this.prepareItemsData(data.items, id) : undefined;

    await this.purchaseRepository.updateWithItems(id, updateData, items);
    return this.getById(id);
  }

  async updateStatus(id: string, status: PurchaseData['status']) {
    const updateData: Partial<PurchaseData> = { 
      status,
      ...(status === 'received' && { received_date: new Date() })
    };

    await this.purchaseRepository.update(id, updateData);
    return this.getById(id);
  }

  async receivePurchase(id: string, receivedItems?: any[]) {
    await this.purchaseRepository.updateReceivedItems(id, receivedItems);
    return this.getById(id);
  }

  async addPayment(id: string, amount: number) {
    await this.purchaseRepository.updatePayment(id, amount);
    return this.getById(id);
  }

  async getStats(filters?: { start_date?: string; end_date?: string }) {
    return this.purchaseRepository.getStats(filters);
  }

  async delete(id: string): Promise<boolean> {
    return this.purchaseRepository.deleteWithItems(id);
  }
}
