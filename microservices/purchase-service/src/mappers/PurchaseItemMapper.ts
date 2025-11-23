import { PurchaseItemData, PurchaseItemDTO } from '../models/PurchaseItem';

export class PurchaseItemMapper {
  static toDTO(data: PurchaseItemData): PurchaseItemDTO {
    return {
      id: data.id,
      purchase_id: data.purchase_id,
      product_id: data.product_id,
      product_name: data.product_name,
      product_sku: data.product_sku,
      description: data.description,
      quantity: Number(data.quantity),
      unit_price: Number(data.unit_price),
      discount_amount: Number(data.discount_amount),
      tax_amount: Number(data.tax_amount),
      line_total: Number(data.line_total),
      received_quantity: Number(data.received_quantity),
      created_at: data.created_at.toISOString(),
      updated_at: data.updated_at.toISOString(),
    };
  }

  static toDTOList(dataList: PurchaseItemData[]): PurchaseItemDTO[] {
    return dataList.map(data => this.toDTO(data));
  }
}
