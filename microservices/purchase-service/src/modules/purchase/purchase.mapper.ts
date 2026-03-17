import { CreatePurchaseDto, UpdatePurchaseDto, PurchaseItemDto } from './dto';

/** Maps camelCase DTOs ↔ snake_case DB rows (SRP). */
export class PurchaseMapper {
  static toRow(dto: CreatePurchaseDto, purchaseNumber: string): Record<string, any> {
    return {
      purchase_number: purchaseNumber,
      supplier_id: dto.supplierId,
      purchase_date: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
      expected_delivery_date: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
      subtotal: dto.subtotal,
      tax_amount: dto.taxAmount ?? 0,
      discount_amount: dto.discountAmount ?? 0,
      total_amount: dto.totalAmount,
      paid_amount: dto.paidAmount ?? 0,
      currency: dto.currency ?? 'USD',
      status: 'pending',
      payment_status: 'pending',
      notes: dto.notes ?? null,
      terms_conditions: dto.termsConditions ?? null,
    };
  }

  static updateToRow(dto: UpdatePurchaseDto): Record<string, any> {
    const row: Record<string, any> = {};
    if (dto.supplierId !== undefined) row.supplier_id = dto.supplierId;
    if (dto.purchaseDate !== undefined) row.purchase_date = new Date(dto.purchaseDate);
    if (dto.expectedDeliveryDate !== undefined) row.expected_delivery_date = new Date(dto.expectedDeliveryDate);
    if (dto.subtotal !== undefined) row.subtotal = dto.subtotal;
    if (dto.taxAmount !== undefined) row.tax_amount = dto.taxAmount;
    if (dto.discountAmount !== undefined) row.discount_amount = dto.discountAmount;
    if (dto.totalAmount !== undefined) row.total_amount = dto.totalAmount;
    if (dto.paidAmount !== undefined) row.paid_amount = dto.paidAmount;
    if (dto.currency !== undefined) row.currency = dto.currency;
    if (dto.status !== undefined) row.status = dto.status;
    if (dto.paymentStatus !== undefined) row.payment_status = dto.paymentStatus;
    if (dto.notes !== undefined) row.notes = dto.notes;
    if (dto.termsConditions !== undefined) row.terms_conditions = dto.termsConditions;
    return row;
  }

  static itemToRow(item: PurchaseItemDto, purchaseId: string): Record<string, any> {
    return {
      purchase_id: purchaseId,
      product_id: item.productId,
      product_name: item.productName ?? null,
      product_sku: item.productSku ?? null,
      description: item.description ?? null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount_amount: item.discountAmount ?? 0,
      tax_amount: item.taxAmount ?? 0,
      line_total: item.lineTotal,
      received_quantity: item.receivedQuantity ?? 0,
    };
  }

  static itemsToRows(items: PurchaseItemDto[], purchaseId: string): Record<string, any>[] {
    return items.map((item) => this.itemToRow(item, purchaseId));
  }
}
