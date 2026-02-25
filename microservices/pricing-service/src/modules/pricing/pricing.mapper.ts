import { CreatePricingRuleDto, UpdatePricingRuleDto } from './dto';

/** Maps camelCase DTOs ↔ snake_case DB rows (SRP). */
export class PricingMapper {
  static toRow(dto: CreatePricingRuleDto): Record<string, any> {
    return {
      name: dto.name,
      description: dto.description ?? null,
      type: dto.type,
      value: dto.value,
      product_id: dto.productId ?? null,
      category_id: dto.categoryId ?? null,
      currency: dto.currency ?? 'SAR',
      start_date: dto.startDate ?? null,
      end_date: dto.endDate ?? null,
      min_quantity: dto.minQuantity ?? null,
      max_quantity: dto.maxQuantity ?? null,
      priority: dto.priority ?? 0,
      status: 'active',
    };
  }

  static updateToRow(dto: UpdatePricingRuleDto): Record<string, any> {
    const row: Record<string, any> = {};
    if (dto.name !== undefined) row.name = dto.name;
    if (dto.description !== undefined) row.description = dto.description;
    if (dto.type !== undefined) row.type = dto.type;
    if (dto.value !== undefined) row.value = dto.value;
    if (dto.productId !== undefined) row.product_id = dto.productId;
    if (dto.categoryId !== undefined) row.category_id = dto.categoryId;
    if (dto.startDate !== undefined) row.start_date = dto.startDate;
    if (dto.endDate !== undefined) row.end_date = dto.endDate;
    if (dto.minQuantity !== undefined) row.min_quantity = dto.minQuantity;
    if (dto.maxQuantity !== undefined) row.max_quantity = dto.maxQuantity;
    if (dto.priority !== undefined) row.priority = dto.priority;
    return row;
  }
}
