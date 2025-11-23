import { PurchaseData, PurchaseDTO } from '../models/Purchase';

export class PurchaseMapper {
  static toDTO(data: PurchaseData, items?: any[]): PurchaseDTO {
    return {
      id: data.id,
      purchase_number: data.purchase_number,
      supplier_id: data.supplier_id,
      purchase_date: data.purchase_date.toISOString().split('T')[0],
      expected_delivery_date: data.expected_delivery_date?.toISOString().split('T')[0],
      received_date: data.received_date?.toISOString().split('T')[0],
      subtotal: Number(data.subtotal),
      tax_amount: Number(data.tax_amount),
      discount_amount: Number(data.discount_amount),
      total_amount: Number(data.total_amount),
      paid_amount: Number(data.paid_amount),
      currency: data.currency,
      status: data.status,
      payment_status: data.payment_status,
      notes: data.notes,
      terms_conditions: data.terms_conditions,
      items: items || [],
      created_at: data.created_at.toISOString(),
      updated_at: data.updated_at.toISOString(),
    };
  }

  static toDTOList(dataList: PurchaseData[]): PurchaseDTO[] {
    return dataList.map(data => this.toDTO(data));
  }
}
