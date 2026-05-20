import {
  CreateReturnDto, UpdateReturnDto, CreateReturnItemDto,
} from './dto';

/** Maps camelCase DTOs ↔ snake_case DB rows (SRP). */
export class ReturnMapper {
  static toRow(dto: CreateReturnDto, returnNumber: string, totalAmount: number): Record<string, any> {
    return {
      return_number: returnNumber,
      sale_id: dto.saleId,
      customer_id: dto.customerId,
      return_date: dto.returnDate,
      return_type: dto.returnType,
      reason: dto.reason,
      notes: dto.notes ?? null,
      total_amount: totalAmount,
      refund_amount: 0,
      refund_status: 'pending',
      status: 'pending',
    };
  }

  static updateToRow(dto: UpdateReturnDto): Record<string, any> {
    const row: Record<string, any> = {};
    if (dto.returnDate !== undefined) row.return_date = dto.returnDate;
    if (dto.returnType !== undefined) row.return_type = dto.returnType;
    if (dto.reason !== undefined) row.reason = dto.reason;
    if (dto.notes !== undefined) row.notes = dto.notes;
    if (dto.status !== undefined) row.status = dto.status;
    if (dto.refundStatus !== undefined) row.refund_status = dto.refundStatus;
    return row;
  }

  static itemToRow(dto: CreateReturnItemDto, returnId: string): Record<string, any> {
    const lineTotal = dto.quantityReturned * dto.unitPrice;
    return {
      return_id: returnId,
      sale_item_id: dto.saleItemId,
      product_id: dto.productId,
      product_name: dto.productName,
      product_sku: dto.productSku ?? null,
      quantity_returned: dto.quantityReturned,
      original_quantity: dto.originalQuantity,
      unit_price: dto.unitPrice,
      line_total: lineTotal,
      condition: dto.condition,
      notes: dto.notes ?? null,
    };
  }

  static calculateTotal(items: CreateReturnItemDto[]): number {
    return items.reduce((sum, i) => sum + i.quantityReturned * i.unitPrice, 0);
  }
}
