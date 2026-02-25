import { Injectable, NotFoundException } from '@nestjs/common';
import { PricingRepository } from './pricing.repository';
import {
  CreatePricingRuleDto, UpdatePricingRuleDto, PricingFiltersDto,
  CalculatePriceDto, PricingRuleType, PricingRuleStatus,
} from './dto';
import { PricingMapper } from './pricing.mapper';

@Injectable()
export class PricingService {
  constructor(private readonly repo: PricingRepository) {}

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Pricing rule not found');
    return row;
  }

  async getAll(filters: PricingFiltersDto) {
    return this.repo.findAll(filters);
  }

  async create(dto: CreatePricingRuleDto) {
    return this.repo.create(PricingMapper.toRow(dto));
  }

  async update(id: string, dto: UpdatePricingRuleDto) {
    await this.getById(id);
    return this.repo.update(id, PricingMapper.updateToRow(dto));
  }

  async remove(id: string) {
    await this.getById(id);
    return this.repo.delete(id);
  }

  async activate(id: string) {
    await this.getById(id);
    return this.repo.update(id, { status: PricingRuleStatus.ACTIVE });
  }

  async deactivate(id: string) {
    await this.getById(id);
    return this.repo.update(id, { status: PricingRuleStatus.INACTIVE });
  }

  async getStats() {
    return this.repo.getStats();
  }

  /** Apply all matching rules to compute final price. */
  async calculatePrice(dto: CalculatePriceDto) {
    const rules = await this.repo.findActiveForProduct(dto.productId, dto.quantity);
    let finalPrice = dto.basePrice;

    for (const rule of rules) {
      finalPrice = this.applyRule(finalPrice, rule, dto.quantity);
    }

    return {
      productId: dto.productId,
      basePrice: dto.basePrice,
      finalPrice: Math.max(0, finalPrice),
      quantity: dto.quantity,
      totalPrice: Math.max(0, finalPrice) * dto.quantity,
      rulesApplied: rules.length,
    };
  }

  private applyRule(price: number, rule: any, quantity: number): number {
    switch (rule.type) {
      case PricingRuleType.FIXED:
        return price - rule.value;
      case PricingRuleType.PERCENTAGE:
        return price * (1 - rule.value / 100);
      case PricingRuleType.TIERED:
        return quantity >= (rule.min_quantity ?? 0) ? price - rule.value : price;
      case PricingRuleType.BUNDLE:
        return price - rule.value;
      default:
        return price;
    }
  }
}
