import { CreateInventoryDto, UpdateInventoryDto } from './dto';

/** Maps camelCase DTOs ↔ snake_case DB rows (SRP). */
export class InventoryMapper {
  static toRow(dto: CreateInventoryDto): Record<string, any> {
    return {
      product_id: dto.productId,
      product_name: dto.productName,
      sku: dto.sku,
      category: dto.category ?? null,
      current_stock: dto.currentStock,
      minimum_stock: dto.minimumStock ?? 0,
      maximum_stock: dto.maximumStock ?? 0,
      unit_cost: dto.unitCost ?? 0,
      unit_price: dto.unitPrice ?? 0,
      location: dto.location ?? null,
      supplier: dto.supplier ?? null,
      notes: dto.notes ?? null,
    };
  }

  static updateToRow(dto: UpdateInventoryDto): Record<string, any> {
    const row: Record<string, any> = {};
    if (dto.productName !== undefined) row.product_name = dto.productName;
    if (dto.sku !== undefined) row.sku = dto.sku;
    if (dto.category !== undefined) row.category = dto.category;
    if (dto.currentStock !== undefined) row.current_stock = dto.currentStock;
    if (dto.minimumStock !== undefined) row.minimum_stock = dto.minimumStock;
    if (dto.maximumStock !== undefined) row.maximum_stock = dto.maximumStock;
    if (dto.unitCost !== undefined) row.unit_cost = dto.unitCost;
    if (dto.unitPrice !== undefined) row.unit_price = dto.unitPrice;
    if (dto.location !== undefined) row.location = dto.location;
    if (dto.supplier !== undefined) row.supplier = dto.supplier;
    if (dto.status !== undefined) row.status = dto.status;
    if (dto.notes !== undefined) row.notes = dto.notes;
    return row;
  }
}
