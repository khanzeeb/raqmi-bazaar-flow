import { InvoiceItem } from '../models/InvoiceItem';

export class InvoiceItemMapper {
  static toDTO(item: InvoiceItem): any {
    return {
      id: item.id,
      invoiceId: item.invoice_id,
      productId: item.product_id,
      productName: item.product_name,
      description: item.description,
      quantity: parseFloat(item.quantity.toString()),
      unitPrice: parseFloat(item.unit_price.toString()),
      discount: parseFloat(item.discount.toString()),
      taxRate: parseFloat(item.tax_rate.toString()),
      total: parseFloat(item.total.toString()),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  static toDTOList(items: InvoiceItem[]): any[] {
    return items.map(item => this.toDTO(item));
  }
}
